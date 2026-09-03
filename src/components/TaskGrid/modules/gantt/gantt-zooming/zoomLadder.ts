import { GanttStatic } from "gantt-trial";
import { countColumnsInRange, getFinestScale, getUnitDays, IGanttZoomLevelDefinition } from "./zoomScales";

/** One position on the ladder, as the chart understands it: which level, and how wide its columns are. */
export interface IGanttZoomStop {
    levelIndex: number;
    columnWidth: number;
    /** How much of the timeline a day takes up here. What makes the ladder comparable across levels. */
    pixelsPerDay: number;
}

/** How much of the viewport a fitted range leaves as breathing room. */
const FIT_VIEWPORT_MARGIN = 0.1;

/**
 * Every zoom position there is, in one order, most zoomed out first.
 *
 * A level covers a band of zoom - its column widths over its own unit - and consecutive levels overlap,
 * because a unit is not always exactly twice the next one. So a level starts at the first width that is
 * not a step backwards from where the previous level ended: without that, crossing into a level would
 * zoom *out* wherever the bands overlap.
 *
 * Where a unit is exactly twice the next, the bands meet and the new level's first position has the zoom
 * the old level's last one had. That position is kept deliberately: it subdivides the header without
 * moving a single bar, which is what makes zooming across a boundary feel controlled.
 */
export const getZoomStops = (levels: IGanttZoomLevelDefinition[], columnWidths: number[]): IGanttZoomStop[] => {
    const stops: IGanttZoomStop[] = [];
    let coarsestSoFar = 0;
    levels.forEach((level, levelIndex) => {
        const scale = getFinestScale(level);
        if (!scale) {
            return;
        }
        const unitDays = getUnitDays(scale);
        columnWidths.forEach(columnWidth => {
            const pixelsPerDay = columnWidth / unitDays;
            if (pixelsPerDay < coarsestSoFar) {
                return;
            }
            stops.push({ levelIndex, columnWidth, pixelsPerDay });
            coarsestSoFar = pixelsPerDay;
        });
    });
    return stops;
};

/** A rung as the slider's continuous 0-100, which is what a view stored before the ladder existed. */
export const getPercentFromStopIndex = (stopIndex: number, stopCount: number): number => {
    return stopCount > 1 ? (stopIndex / (stopCount - 1)) * 100 : 100;
};

/** The rung a stored 0-100 percent meant. Exact while the same levels are usable as when it was stored. */
export const getStopIndexFromPercent = (percent: number, stopCount: number): number => {
    return clampStopIndex((Math.max(0, Math.min(100, percent)) / 100) * (stopCount - 1), stopCount);
};

export const clampStopIndex = (stopIndex: number, stopCount: number): number => {
    return Math.max(0, Math.min(stopCount - 1, Math.round(stopIndex)));
};

/**
 * The rung the chart is standing on, from the level and column width it is actually rendering.
 *
 * Nearest rather than exact: the chart's column width can be a value no rung holds, either because a
 * level carries a width of its own or because something else wrote the config.
 */
export const findStopIndex = (stops: IGanttZoomStop[], levelIndex: number, columnWidth: number): number => {
    let bestIndex = 0;
    let bestLevelDistance = Number.POSITIVE_INFINITY;
    let bestWidthDistance = Number.POSITIVE_INFINITY;
    stops.forEach((stop, index) => {
        const levelDistance = Math.abs(stop.levelIndex - levelIndex);
        const widthDistance = Math.abs(stop.columnWidth - columnWidth);
        if (levelDistance < bestLevelDistance || (levelDistance === bestLevelDistance && widthDistance < bestWidthDistance)) {
            bestLevelDistance = levelDistance;
            bestWidthDistance = widthDistance;
            bestIndex = index;
        }
    });
    return bestIndex;
};

/**
 * The rung a stored zoom means, matched on the scale it was stored with rather than on its position.
 *
 * Which levels are usable depends on what the date columns hold, so a stored index means different things
 * on different views. A stored scale that is no longer usable resolves to the nearest one that is.
 */
export const findStopIndexForScale = (parameters: {
    stops: IGanttZoomStop[];
    levels: IGanttZoomLevelDefinition[];
    unit: string;
    step: number;
    columnWidth: number;
}): number | undefined => {
    const { stops, levels, unit, step, columnWidth } = parameters;
    const levelIndex = levels.findIndex(level => {
        const scale = getFinestScale(level);
        return scale?.unit === unit && scale.step === step;
    });
    if (levelIndex < 0) {
        return undefined;
    }
    return findStopIndex(stops, levelIndex, columnWidth);
};

/**
 * The most zoomed-in rung at which a range still fits the viewport, with a margin left over.
 *
 * Walked from the zoomed-in end down, so the answer is the closest fit rather than the first rung that
 * happens to work. The coarsest rung when nothing fits — there is nothing better to offer.
 */
export const findFitStopIndex = (parameters: {
    stops: IGanttZoomStop[];
    levels: IGanttZoomLevelDefinition[];
    startDate: Date;
    endDate: Date;
    viewportWidth: number;
    gantt: GanttStatic;
}): number => {
    const { stops, levels, startDate, endDate, viewportWidth, gantt } = parameters;
    if (!viewportWidth || !stops.length) {
        return 0;
    }

    const usableWidth = viewportWidth * (1 - FIT_VIEWPORT_MARGIN);
    for (let stopIndex = stops.length - 1; stopIndex >= 0; stopIndex--) {
        const { levelIndex, columnWidth } = stops[stopIndex];
        const scale = getFinestScale(levels[levelIndex]);
        if (!scale) {
            continue;
        }
        if (countColumnsInRange({ startDate, endDate, scale, gantt }) * columnWidth <= usableWidth) {
            return stopIndex;
        }
    }

    return 0;
};
