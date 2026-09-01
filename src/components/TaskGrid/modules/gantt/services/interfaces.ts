//types only: the map names every dependency by its contract, so registering a service can never pull an
//implementation into the bundle
import type { GanttStatic } from "gantt-trial";
import type { ILocalizationService, IServiceLocator } from "@utils";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import type { IGanttComponents } from "@components/TaskGrid/modules/interfaces";
import type { IGanttExpansion } from "../gantt-expansion";
import type { IGanttViewStateProvider } from "../gantt-view-state";
import type { IGanttData } from "../gantt-data";
import type { IGanttDates } from "../gantt-dates";
import type { IGanttDragging } from "../gantt-dragging";
import type { IGanttInfiniteTimeline } from "../gantt-infinite-timeline";
import type { IGanttMarkersProvider, IGanttMarkersModule } from "../modules/markers";
import type { IGanttSelection } from "../gantt-selection";
import type { IGanttZooming } from "../gantt-zooming";
import type { IGanttLabels } from "../labels";

/**
 * The task columns only the Gantt needs. Kept apart from the grid's `IFieldMapping`: without this
 * module none of them mean anything.
 */
export interface IGanttFieldMapping {
    /** Attribute holding the task's start date. The timeline has nothing to draw without it. */
    startDate: string;
    /** Attribute holding the task's end date. */
    endDate: string;
    /** Numeric 0–100 progress attribute. Omitted means bars render without progress. */
    percentComplete?: string;
    /**
     * Option-set attribute carrying the task's status. Its option colour is what tints the task
     * tooltip; omitted leaves the tooltip untinted.
     */
    statusCode?: string;
}

/**
 * Everything the Gantt itself hands around, keyed by name and typed by its contract. Nothing of the
 * grid's belongs here — the grid's own locator is the one entry that crosses over, under
 * `taskGridServices`.
 *
 * **The chart's parts say when the chart is live.** `fieldMapping`, `labels`, `components` and
 * `ganttViewState` are there from the moment the module is built. `ganttContainer` arrives when the timeline mounts,
 * `ganttChart` the moment the manager creates the chart — and every one of the parts below it is
 * registered only *after* `gantt.init`, so anything waiting on one of them is waiting for a chart that
 * can be drawn on. Registering them earlier would silently break that.
 */
export interface IGanttServiceMap {
    /**
     * The grid's locator: the task data, the columns, the control, the AG Grid instance, the other
     * modules. The seam between the two maps — what the Gantt holds and what the grid holds stay separate,
     * and this is how you cross.
     */
    taskGridServices: ITaskGridServiceLocator;
    /** How the timeline is set up on the view that is open: zoom, weekends, panel width, anchor. */
    ganttViewState: IGanttViewStateProvider;
    /** The task columns the timeline draws from. */
    fieldMapping: IGanttFieldMapping;
    /** Resolves the module's own strings — separate from the grid's `ITaskGridLabels`. */
    labels: ILocalizationService<IGanttLabels>;
    /** The replaceable parts of the Gantt's UI, as the module resolved them. */
    components: IGanttComponents;
    /** The element the chart is drawn into. Registered by the timeline component on mount. */
    ganttContainer: HTMLDivElement;
    /** The chart itself, from the moment it exists — before `init`, so the parts below can configure it. */
    ganttChart: GanttStatic;
    /** Reads the task dates off the records, and off the field mapping. */
    ganttDates: IGanttDates;
    /** Keeps the chart's tasks in step with the grid's records. */
    ganttData: IGanttData;
    /** Dragging and resizing a task bar. */
    ganttDragging: IGanttDragging;
    /**
     * The Gantt's markers module, UI included. Present when it is registered — and its absence is what
     * makes a timeline draw no markers.
     */
    markersModule: IGanttMarkersModule;
    /** The markers drawn over the timeline. Registered by the markers module once the chart exists. */
    ganttMarkers: IGanttMarkersProvider;
    /** Selecting tasks on the chart, and mirroring the grid's selection. */
    ganttSelection: IGanttSelection;
    /** The zoom levels, and the slider's 0-100 mapping onto them. */
    ganttZooming: IGanttZooming;
    /** Keeps the rendered date range around what is on screen. */
    ganttInfiniteTimeline: IGanttInfiniteTimeline;
    /** Which rows are open, on both halves of the split view. */
    ganttExpansion: IGanttExpansion;
}

/** Where everything inside the Gantt module reaches whatever it needs. */
export interface IGanttServiceLocator extends IServiceLocator<IGanttServiceMap> {
}
