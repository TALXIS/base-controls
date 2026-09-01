import { IGanttServiceLocator } from "../../services";
import { GanttTaskCreateComponents } from "./moduleComponents";

/** Every component the task-create module renders. Override any subset through the module's `components`. */
export interface IGanttTaskCreateComponents {
    /** The previews drawn over the timeline while a task is being drawn. */
    onRenderCreateLayer: () => JSX.Element;
}

/** What the task-create module contributes. Built by {@link createGanttTaskCreateModule}. */
export interface IGanttTaskCreateModule {
    /** The module's UI. */
    components: IGanttTaskCreateComponents;
}

/** Options for {@link createGanttTaskCreateModule}. */
export interface IGanttTaskCreateModuleOptions {
    /** The Gantt's own locator, from `IGanttModuleOptions.onGetModules`. */
    services: IGanttServiceLocator;
    /** Replaces the module's UI. Anything omitted keeps the component the module ships. */
    components?: Partial<IGanttTaskCreateComponents>;
}

/**
 * Builds the Gantt's task-create module: holding Ctrl and dragging across empty timeline space creates a
 * task spanning what was dragged, above the row it was drawn on.
 *
 * Assign it to `taskCreate` on the Gantt's `onGetModules`. Without it the timeline is one you cannot draw
 * new tasks on — and it does nothing either way on a grid whose `enableTaskCreation` is off.
 *
 * @example
 * ```ts
 * createGanttModule({
 *     fieldMapping,
 *     services,
 *     onGetModules: ({ services }) => ({
 *         taskCreate: createGanttTaskCreateModule({ services }),
 *     }),
 * })
 * ```
 */
export const createGanttTaskCreateModule = (options: IGanttTaskCreateModuleOptions): IGanttTaskCreateModule => {
    return { components: { ...GanttTaskCreateComponents, ...options.components } };
};
