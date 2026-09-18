import { GanttStatic } from "gantt-trial";

/** One scale row of a zoom level — a unit, and how many of it per column. */
export interface IGanttScaleDefinition {
    unit: string;
    step?: number;
}

/** One zoom level, as the chart's zoom extension holds it. */
export interface IGanttZoomLevelDefinition {
    scales?: IGanttScaleDefinition[];
}

/** The scale a level changes fastest on — the one that decides how many columns a range needs. */
export interface IGanttFinestScale {
    unit: string;
    step: number;
}

/** A grid of dates a scale's columns fall on: its unit, and how many of that unit each column spans. */
export interface IGanttScaleLattice {
    unit: string;
    step: number;
}

/** Where a lattice with a step wider than one unit is counted from. Any fixed date does; this one is a Saturday. */
const LATTICE_ANCHOR = new Date(2000, 0, 1);

const MILLISECONDS_PER_DAY = 86_400_000;

/** How long a column of a unit is, in days. An average for the units that vary; see {@link getUnitDays}. */
const UNIT_DAYS: Record<string, number> = {
    hour: 1 / 24,
    day: 1,
    week: 7,
    month: 30.4375,
    quarter: 91.3125,
    year: 365.25,
};

/** Guards the walk in {@link countColumnsInRange} for units the millisecond table cannot answer. */
const MAX_COUNTED_COLUMNS = 10_000;

const MILLISECONDS_PER_UNIT: Record<string, number> = {
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
};

/** Coarsest last: what makes one scale finer than another. */
const UNIT_ORDER = ['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'];

/** The scale within a level that changes fastest — the one column widths are measured against. */
export const getFinestScale = (level: IGanttZoomLevelDefinition): IGanttFinestScale | null => {
    if (!level.scales?.length) {
        return null;
    }

    let finest: IGanttFinestScale | null = null;
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
 * How many days a column of this scale spans.
 *
 * A month and a quarter are averages, because they are not fixed durations. Good enough for what asks:
 * which zoom position a scale sits at, and how wide a range to render - never how wide a column is drawn.
 */
export const getUnitDays = (scale: IGanttFinestScale): number => {
    return (UNIT_DAYS[scale.unit] ?? 1) * scale.step;
};

/**
 * The lattice a level's columns are phased against: its coarsest row.
 *
 * Every finer row of a level divides that row - a 14-day header over 2-day columns, a day over hours - so
 * putting the range start on the coarsest row's lattice puts every row of the level on a stable grid.
 */
export const getSnapLattice = (level: IGanttZoomLevelDefinition): IGanttScaleLattice | undefined => {
    const coarsest = level.scales?.[0];
    return coarsest && { unit: coarsest.unit, step: coarsest.step ?? 1 };
};

/**
 * The nearest lattice point at or before a date.
 *
 * The chart phases a scale on the rendered range's start — `unit_start(start_date)`, then one step at a
 * time — and holds no lattice of its own. So a range start that is not on the lattice puts the columns on
 * different boundaries than the last render did: a fortnight column that was Mon-Tue becomes Tue-Wed, and
 * a 6-hour grid drifts off midnight. Snapping the start is what keeps a grid still while the range moves.
 */
export const snapToLattice = (gantt: GanttStatic, date: Date, lattice: IGanttScaleLattice): Date => {
    const unitStart = getUnitStart(gantt, lattice.unit, date);
    const unitDays = lattice.step > 1 ? UNIT_DAYS[lattice.unit] : undefined;
    //only the units of a fixed length are counted this way, and those are the only ones a level steps by
    if (!unitDays || lattice.unit === 'month' || lattice.unit === 'quarter' || lattice.unit === 'year') {
        return unitStart;
    }
    const anchor = getUnitStart(gantt, lattice.unit, LATTICE_ANCHOR);
    //rounded, because a day of local time is not always 24 hours: a step spans several units, so a
    //daylight saving hour can never reach the next lattice point
    const unitsSinceAnchor = Math.round((+unitStart - +anchor) / (unitDays * MILLISECONDS_PER_DAY));
    const stepsSinceAnchor = Math.floor(unitsSinceAnchor / lattice.step);
    return gantt.date.add(anchor, stepsSinceAnchor * lattice.step, lattice.unit as never);
};

const getUnitStart = (gantt: GanttStatic, unit: string, date: Date): Date => {
    const { date: dates } = gantt;
    switch (unit) {
        case 'hour': return dates.hour_start(date);
        case 'week': return dates.week_start(date);
        case 'month': return dates.month_start(date);
        case 'quarter': return dates.quarter_start(date);
        case 'year': return dates.year_start(date);
        default: return dates.day_start(date);
    }
};

/**
 * Whether single days are resolvable on the scale, which is what makes marking weekends meaningful.
 *
 * True where a row is single days, and where the finest row divides one — an hour scale on a range snapped
 * to midnight sits inside a day, so a weekend is still a whole number of columns. A scale of several days
 * is the case this excludes: the chart decides whether to hide a column from its start date alone, so a
 * two-day column starting on a Saturday would take the Monday with it.
 *
 * Read off the chart rather than asked of the zooming part: the templates that need it run during `init`,
 * before the parts are registered. Derived from the level's own scales rather than its index, because the
 * ladder is only as long as the date columns' precision allows.
 */
export const isDayScaleVisible = (gantt: GanttStatic): boolean => {
    const level = gantt.ext.zoom.getLevels()[gantt.ext.zoom.getCurrentLevel()];
    if (level?.scales?.some(scale => scale.unit === 'day' && (scale.step ?? 1) === 1)) {
        return true;
    }
    const finest = level && getFinestScale(level);
    return finest?.unit === 'hour' && 24 % finest.step === 0;
};

/** How many columns of this scale the range spans. */
export const countColumnsInRange = (parameters: {
    startDate: Date;
    endDate: Date;
    scale: IGanttFinestScale;
    gantt: GanttStatic;
}): number => {
    const { startDate, endDate, scale, gantt } = parameters;
    //from the start of the unit the range begins in, because that is where the chart starts a column -
    //counted from the range's own start it comes out a column short, and a fit that is a column short
    //clips the last task off the screen
    const start = getUnitStart(gantt, scale.unit, startDate);
    const millisecondsPerUnit = MILLISECONDS_PER_UNIT[scale.unit];
    if (millisecondsPerUnit) {
        return Math.ceil((endDate.getTime() - start.getTime()) / (scale.step * millisecondsPerUnit));
    }

    //months, quarters and years are not a fixed number of milliseconds, so they are counted by walking
    let current = new Date(start);
    let count = 0;
    while (current < endDate && count < MAX_COUNTED_COLUMNS) {
        current = gantt.date.add(current, scale.step, scale.unit as never);
        count++;
    }

    return count;
};

/**
 * How much time one pixel spans at a level and column width — what a date range has to be sized against.
 *
 * Measured with the chart's own calendar arithmetic from `near`, because a month, a quarter and a year are
 * not fixed durations: how wide a column is depends on where on the timeline it sits.
 */
export const getMillisecondsPerPixel = (parameters: {
    gantt: GanttStatic;
    level: IGanttZoomLevelDefinition;
    columnWidth: number;
    near: Date;
}): number => {
    const { gantt, level, columnWidth, near } = parameters;
    const scale = getFinestScale(level);
    if (!scale || columnWidth <= 0) {
        return 0;
    }
    const columnDuration = +gantt.date.add(near, scale.step, scale.unit as never) - +near;
    return columnDuration / columnWidth;
};
