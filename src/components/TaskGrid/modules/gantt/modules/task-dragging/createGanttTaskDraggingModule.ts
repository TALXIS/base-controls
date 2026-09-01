import { IGanttServiceLocator } from "../../services";
import { GanttTaskDragging } from "./GanttTaskDragging";

/** Which drag modes the chart is set up for. Read by `configureChart`. */
export interface IGanttTaskDraggingSettings {
    enableMove: boolean;
    enableResize: boolean;
}

/** What the task-dragging module contributes. Built by {@link createGanttTaskDraggingModule}. */
export interface IGanttTaskDraggingModule {
    /** What the module was asked to allow. What the chart is configured from. */
    settings: IGanttTaskDraggingSettings;
}

/** Options for {@link createGanttTaskDraggingModule}. */
export interface IGanttTaskDraggingModuleOptions {
    /** The Gantt's own locator, from `IGanttModuleOptions.onGetModules`. */
    services: IGanttServiceLocator;
    /** Whether a bar can be dragged to another date. Defaults to `true`. */
    enableMove?: boolean;
    /** Whether a bar's ends can be dragged to change its duration. Defaults to `true`. */
    enableResize?: boolean;
}

/**
 * Builds the Gantt's task-dragging module: dragging a bar moves the task, dragging its ends changes how
 * long it runs, and either writes the dates back through the grid's records.
 *
 * Assign it to `taskDragging` on the Gantt's `onGetModules`. Without it the bars are fixed — the chart is
 * configured to refuse both gestures rather than to move a bar that nothing would save. Editing also has to
 * be allowed at all: a drag is refused while `enableTaskEditing` is off, the way the grid's own cells are.
 *
 * @example
 * ```ts
 * createGanttModule({
 *     fieldMapping,
 *     services,
 *     onGetModules: ({ services }) => ({
 *         taskDragging: createGanttTaskDraggingModule({ services, enableMove: false }),
 *     }),
 * })
 * ```
 */
export const createGanttTaskDraggingModule = (options: IGanttTaskDraggingModuleOptions): IGanttTaskDraggingModule => {
    const { services } = options;
    const settings: IGanttTaskDraggingSettings = {
        enableMove: options.enableMove ?? true,
        enableResize: options.enableResize ?? true,
    };

    //there is nothing to attach handlers to until the manager creates the chart, so the module waits for it
    //rather than being built with one. Held by the chart's own handlers from then on: nothing resolves it,
    //and it goes when the chart does
    services.whenAvailable('ganttChart', () => new GanttTaskDragging({ services, settings }));

    return { settings };
};
