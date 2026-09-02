/**
 * Every string the weekends module renders. Overridden through
 * {@link IGanttWeekendsModuleOptions.labels}.
 */
export interface IGanttWeekendsLabels {
    /** The toggle in the grid's settings callout. */
    hideWeekends: string;
}

/** The defaults for {@link IGanttWeekendsLabels}. */
export const GANTT_WEEKENDS_LABELS: IGanttWeekendsLabels = {
    hideWeekends: 'Hide weekends',
};
