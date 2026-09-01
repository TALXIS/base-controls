/**
 * Every string the markers module renders. Overridden through
 * {@link IGanttMarkersModuleOptions.labels}.
 */
export interface IGanttMarkersLabels {
    /** The today marker's label. */
    today: string;
    /** The project start marker's label. */
    projectStart: string;
    /** The project end marker's label. */
    projectEnd: string;
}

/** The defaults for {@link IGanttMarkersLabels}. */
export const GANTT_MARKERS_LABELS: IGanttMarkersLabels = {
    today: 'Today',
    projectStart: 'Project Start',
    projectEnd: 'Project End',
};
