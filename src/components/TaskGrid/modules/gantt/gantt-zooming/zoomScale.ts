import { GanttStatic } from "gantt-trial";
import { ZoomingConfig } from "./ZoomingConfig";
import { IGanttZoomLevelDefinition } from "./zoomApi";

/** One position on the slider, as the chart understands it: which level, and how wide its columns are. */
export interface IZoomState {
    levelIndex: number;
    columnWidth: number;
}

/** The scale a level changes fastest on — the one that decides how many columns a range needs. */
interface IScale {
    unit: string;
    step: number;
}

/** How much of the fitted range is left as breathing room, in slider percent. */
const FIT_MARGIN_PERCENT = 5;

/** Guards the walk in {@link countColumnsInRange} for units the millisecond table cannot answer. */
const MAX_COUNTED_COLUMNS = 10_000;

const MILLISECONDS_PER_UNIT: Record<string, number> = {
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
};

/** Coarsest last: what makes one scale finer than another. */
const UNIT_ORDER = ['hour', 'day', 'week', 'month', 'quarter', 'year'];

/**
 * How many slider positions there are: every zoom level, times every column width inside it.
 *
 * The slider is continuous and the chart is not — it has levels, and a column width that steps within a
 * level. The two are laid end to end, so 0-100 walks all of them in order.
 */
export const getStateCount = (levelCount: number): number => {
    return levelCount * getWidthSlotCount();
};

/** The slider step that moves exactly one position. */
export const getTickStep = (levelCount: number): number => {
    const stateCount = getStateCount(levelCount);
    return stateCount > 1 ? 100 / (stateCount - 1) : 100;
};

/** Which level and column width a slider percentage means. */
export const getZoomState = (percent: number, levelCount: number): IZoomState => {
    const widthSlots = getWidthSlotCount();
    const stateCount = getStateCount(levelCount);
    const stateIndex = Math.round((clampPercent(percent) / 100) * (stateCount - 1));

    return {
        levelIndex: Math.floor(stateIndex / widthSlots),
        columnWidth: ZoomingConfig.scrollZoomMinColumnWidth + (stateIndex % widthSlots) * ZoomingConfig.scrollZoomWidthStep,
    };
};

/**
 * The largest slider percentage at which the range still fits the viewport, less a margin.
 *
 * Walked from the most zoomed-in end down, so the answer is the closest fit rather than the first one that
 * happens to work. `0` when nothing fits, or when there is no viewport to fit into yet.
 */
export const findFitPercent = (parameters: {
    startDate: Date;
    endDate: Date;
    levels: IGanttZoomLevelDefinition[];
    viewportWidth: number;
    gantt: GanttStatic;
}): number => {
    const { startDate, endDate, levels, viewportWidth, gantt } = parameters;
    if (!viewportWidth || !levels.length) {
        return 0;
    }

    const stateCount = getStateCount(levels.length);
    for (let stateIndex = stateCount - 1; stateIndex >= 0; stateIndex--) {
        const { levelIndex, columnWidth } = getZoomState(stateCount > 1 ? (stateIndex / (stateCount - 1)) * 100 : 100, levels.length);
        const scale = getFinestScale(levels[levelIndex]);
        if (!scale) {
            continue;
        }
        const columnCount = countColumnsInRange({ startDate, endDate, scale, gantt });
        if (columnCount * columnWidth <= viewportWidth) {
            const percent = stateCount > 1 ? (stateIndex / (stateCount - 1)) * 100 : 100;
            return Math.max(0, percent - FIT_MARGIN_PERCENT);
        }
    }

    return 0;
};

/** How many columns of this scale the range spans. */
export const countColumnsInRange = (parameters: {
    startDate: Date;
    endDate: Date;
    scale: IScale;
    gantt: GanttStatic;
}): number => {
    const { startDate, endDate, scale, gantt } = parameters;
    const millisecondsPerUnit = MILLISECONDS_PER_UNIT[scale.unit];
    if (millisecondsPerUnit) {
        return Math.ceil((endDate.getTime() - startDate.getTime()) / (scale.step * millisecondsPerUnit));
    }

    //months, quarters and years are not a fixed number of milliseconds, so they are counted by walking
    let current = new Date(startDate);
    let count = 0;
    while (current < endDate && count < MAX_COUNTED_COLUMNS) {
        current = gantt.date.add(current, scale.step, scale.unit as never);
        count++;
    }

    return count;
};

/** The scale within a level that changes fastest — the one column widths are measured against. */
export const getFinestScale = (level: IGanttZoomLevelDefinition): IScale | null => {
    if (!level.scales?.length) {
        return null;
    }

    let finest: IScale | null = null;
    for (const scale of level.scales) {
        const step = scale.step ?? 1;
        if (!finest
            || UNIT_ORDER.indexOf(scale.unit) < UNIT_ORDER.indexOf(finest.unit)
            || (scale.unit === finest.unit && step < finest.step)) {
            finest = { unit: scale.unit, step };
        }
    }

    return finest;
};

/**
 * The levels worth showing: one that subdivides a day says nothing without a time of day to show.
 *
 * Filtered by what a level *is* rather than by its position, so a level added or reordered later needs no
 * change here.
 */
export const getUsableLevels = <TLevel extends IGanttZoomLevelDefinition>(levels: TLevel[], hasTimeOfDay: boolean): TLevel[] => {
    return hasTimeOfDay ? levels : levels.filter(level => getFinestScale(level)?.unit !== 'hour');
};

/**
 * Whether single days are on the scale, which is what makes marking weekends meaningful.
 *
 * Read off the chart rather than asked of the zooming part: the templates that need it run during `init`,
 * before the parts are registered. Derived from the level's own scales rather than its index, because the
 * ladder is only as long as the date columns' precision allows.
 */
export const isDayScaleVisible = (gantt: GanttStatic): boolean => {
    const level = gantt.ext.zoom.getLevels()[gantt.ext.zoom.getCurrentLevel()];
    return !!level?.scales?.some(scale => scale.unit === 'day' && (scale.step ?? 1) === 1);
};

export const clampPercent = (percent: number): number => {
    return Math.max(0, Math.min(100, percent));
};

/** How many column widths a level steps through, from our own zoom configuration. */
const getWidthSlotCount = (): number => {
    const { scrollZoomMinColumnWidth, scrollZoomMaxColumnWidth, scrollZoomWidthStep } = ZoomingConfig;
    return Math.round((scrollZoomMaxColumnWidth - scrollZoomMinColumnWidth) / scrollZoomWidthStep) + 1;
};
