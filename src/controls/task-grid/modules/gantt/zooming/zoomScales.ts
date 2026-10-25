import type { GanttStatic, ZoomLevel } from "gantt-trial";

/** A unit and how many of it one column spans. */
export interface IGanttScale {
    unit: string;
    step: number;
}

//any fixed date; columns of a multi-unit step are counted from it
const LATTICE_ANCHOR = new Date(2000, 0, 1);

const MILLISECONDS_PER_DAY = 86_400_000;

//averages for the units of varying length
const UNIT_DAYS: Record<string, number> = {
    hour: 1 / 24,
    day: 1,
    week: 7,
    month: 30.4375,
    quarter: 91.3125,
    year: 365.25,
};

const MILLISECONDS_PER_UNIT: Record<string, number> = {
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
};

const MAX_COUNTED_COLUMNS = 10_000;

const UNIT_ORDER = ['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'];

/** The scale within a level that changes fastest. */
export const getFinestScale = (level: ZoomLevel): IGanttScale | null => {
    let finest: IGanttScale | null = null;
    for (const scale of level.scales ?? []) {
        const step = scale.step ?? 1;
        if (!finest || UNIT_ORDER.indexOf(scale.unit) < UNIT_ORDER.indexOf(finest.unit) || (scale.unit === finest.unit && step < finest.step)) {
            finest = { unit: scale.unit, step };
        }
    }
    return finest;
};

/** The levels worth showing: an hour level means nothing without a time of day. */
export const getUsableLevels = (levels: ZoomLevel[], hasTimeOfDay: boolean): ZoomLevel[] => {
    return hasTimeOfDay ? levels : levels.filter(level => getFinestScale(level)?.unit !== 'hour');
};

/** How many days a column of the scale spans, on average. */
export const getUnitDays = (scale: IGanttScale): number => {
    return (UNIT_DAYS[scale.unit] ?? 1) * scale.step;
};

/** The coarsest row of a level, which every finer row divides. */
export const getSnapLattice = (level: ZoomLevel): IGanttScale | undefined => {
    const coarsest = level.scales?.[0];
    return coarsest && { unit: coarsest.unit, step: coarsest.step ?? 1 };
};

/** The nearest lattice point at or before a date. */
export const snapToLattice = (gantt: GanttStatic, date: Date, lattice: IGanttScale): Date => {
    const unitStart = getUnitStart(gantt, lattice.unit, date);
    const unitDays = lattice.step > 1 ? UNIT_DAYS[lattice.unit] : undefined;
    if (!unitDays || lattice.unit === 'month' || lattice.unit === 'quarter' || lattice.unit === 'year') {
        return unitStart;
    }
    const anchor = getUnitStart(gantt, lattice.unit, LATTICE_ANCHOR);
    //rounded: a local day is not always 24 hours
    const unitsSinceAnchor = Math.round((+unitStart - +anchor) / (unitDays * MILLISECONDS_PER_DAY));
    const stepsSinceAnchor = Math.floor(unitsSinceAnchor / lattice.step);
    return gantt.date.add(anchor, stepsSinceAnchor * lattice.step, lattice.unit);
};

const getUnitStart = (gantt: GanttStatic, unit: string, date: Date): Date => {
    switch (unit) {
        case 'hour': return gantt.date.hour_start(date);
        case 'week': return gantt.date.week_start(date);
        case 'month': return gantt.date.month_start(date);
        case 'quarter': return gantt.date.quarter_start(date);
        case 'year': return gantt.date.year_start(date);
        default: return gantt.date.day_start(date);
    }
};

/** Whether whole days are columns on the current level. */
export const isDayScaleVisible = (gantt: GanttStatic): boolean => {
    const level = gantt.ext.zoom.getLevels()[gantt.ext.zoom.getCurrentLevel()];
    if (level?.scales?.some(scale => scale.unit === 'day' && (scale.step ?? 1) === 1)) {
        return true;
    }
    const finest = level && getFinestScale(level);
    return finest?.unit === 'hour' && 24 % finest.step === 0;
};

/** How many columns of the scale the range spans. */
export const countColumnsInRange = (gantt: GanttStatic, startDate: Date, endDate: Date, scale: IGanttScale): number => {
    //from the unit start, as the chart starts a column there
    const start = getUnitStart(gantt, scale.unit, startDate);
    const millisecondsPerUnit = MILLISECONDS_PER_UNIT[scale.unit];
    if (millisecondsPerUnit) {
        return Math.ceil((+endDate - +start) / (scale.step * millisecondsPerUnit));
    }
    let current = start;
    let count = 0;
    while (current < endDate && count < MAX_COUNTED_COLUMNS) {
        current = gantt.date.add(current, scale.step, scale.unit);
        count++;
    }
    return count;
};

/** How much time one pixel spans at a level and column width, measured near a date. */
export const getMillisecondsPerPixel = (gantt: GanttStatic, level: ZoomLevel, columnWidth: number, near: Date): number => {
    const scale = getFinestScale(level);
    if (!scale || columnWidth <= 0) {
        return 0;
    }
    return (+gantt.date.add(near, scale.step, scale.unit) - +near) / columnWidth;
};
