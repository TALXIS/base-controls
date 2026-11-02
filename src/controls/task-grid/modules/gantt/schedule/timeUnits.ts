export const HOURS_PER_DAY = 24;
export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;
export const MILLISECONDS_PER_MINUTE = 60_000;
export const MILLISECONDS_PER_HOUR = MINUTES_PER_HOUR * MILLISECONDS_PER_MINUTE;
export const MILLISECONDS_PER_DAY = HOURS_PER_DAY * MILLISECONDS_PER_HOUR;
export const MILLISECONDS_PER_WEEK = 7 * MILLISECONDS_PER_DAY;

/** The days in each scale unit, averaged for the units of varying length. */
export const DAYS_PER_UNIT: Record<string, number> = {
    hour: 1 / HOURS_PER_DAY,
    day: 1,
    week: 7,
    month: 30.4375,
    quarter: 91.3125,
    year: 365.25,
};
