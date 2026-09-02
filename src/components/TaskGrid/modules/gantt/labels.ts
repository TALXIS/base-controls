/**
 * Every UI string the Gantt module renders. The grid's own strings live in `ITaskGridLabels`; these are
 * the module's, and are overridden through {@link IGanttModuleOptions.labels}.
 */
export interface IGanttLabels {
    /** Accessible name of the zoom slider. */
    zoomSlider: string;
    /** The ribbon command scrolling the timeline to today. */
    goToToday: string;
    /** The ribbon command fitting every task into the visible timeline. */
    zoomToFit: string;
}

/** The defaults for {@link IGanttLabels}. */
export const GANTT_LABELS: IGanttLabels = {
    zoomSlider: 'Zoom slider',
    goToToday: 'Go to today',
    zoomToFit: 'Zoom to fit',
};
