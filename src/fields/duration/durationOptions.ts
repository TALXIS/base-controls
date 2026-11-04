/** The presets offered in minutes when `DurationOptions` is not given. */
export const DEFAULT_DURATION_OPTIONS: number[] = [
    1, 15, 30, 45, 60, 90, 120, 150, 180, 210, 240, 270,
    300, 330, 360, 390, 420, 450, 480, 1440, 2880, 4320,
];

/** The presets offered in minutes for an 8-hour day when `DurationOptions` is not given. */
export const WORKING_DAY_DURATION_OPTIONS: number[] = [1, 3, 5, 7, 10, 14, 30].map(days => days * 8 * 60);
