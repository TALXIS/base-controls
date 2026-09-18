import { IGanttServiceLocator } from "../../services";
import { GanttSelectionBoxComponents } from "./moduleComponents";

/** Every component the selection-box module renders. Override any subset through the module's `components`. */
export interface IGanttSelectionBoxComponents {
    /** Where the band lives. Renders nothing of its own. */
    onRenderSelectionBoxLayer: () => JSX.Element;
}

/** What the selection-box module contributes. Built by {@link createGanttSelectionBoxModule}. */
export interface IGanttSelectionBoxModule {
    /** The module's UI. */
    components: IGanttSelectionBoxComponents;
}

/** Options for {@link createGanttSelectionBoxModule}. */
export interface IGanttSelectionBoxModuleOptions {
    /** The Gantt's own locator, from `IGanttModuleOptions.onGetModules`. */
    services: IGanttServiceLocator;
    /** Replaces the module's UI. Anything omitted keeps the component the module ships. */
    components?: Partial<IGanttSelectionBoxComponents>;
}

/**
 * Builds the Gantt's selection-box module: holding shift and dragging over the timeline selects every task
 * the band crosses.
 *
 * Assign it to `selectionBox` on the Gantt's `onGetModules`. Without it there is no band — clicking a bar
 * still selects, which the Gantt does itself.
 *
 * @example
 * ```ts
 * createGanttModule({
 *     fieldMapping,
 *     services,
 *     onGetModules: ({ services }) => ({
 *         selectionBox: createGanttSelectionBoxModule({ services }),
 *     }),
 * })
 * ```
 */
export const createGanttSelectionBoxModule = (options: IGanttSelectionBoxModuleOptions): IGanttSelectionBoxModule => {
    return { components: { ...GanttSelectionBoxComponents, ...options.components } };
};
