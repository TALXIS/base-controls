/**
 * Every UI string the Gantt module renders. The grid's own strings live in `ITaskGridLabels`; these are
 * the module's, and are overridden through {@link IGanttModuleOptions.labels}.
 */
export interface IGanttLabels {
    /** The weekend toggle in the settings callout. */
    hideWeekends: string;
    /** Accessible name of the zoom slider. */
    zoomSlider: string;
    /** The ribbon command scrolling the timeline to today. */
    goToToday: string;
    /** The ribbon command fitting every task into the visible timeline. */
    zoomToFit: string;
    /** The today marker's label. */
    today: string;
    /** The project start marker's label. */
    projectStart: string;
    /** The project end marker's label. */
    projectEnd: string;
}

/** The defaults for {@link IGanttLabels}. */
export const GANTT_LABELS: IGanttLabels = {
    hideWeekends: 'Hide weekends',
    zoomSlider: 'Zoom slider',
    goToToday: 'Go to today',
    zoomToFit: 'Zoom to fit',
    today: 'Today',
    projectStart: 'Project Start',
    projectEnd: 'Project End',
};
