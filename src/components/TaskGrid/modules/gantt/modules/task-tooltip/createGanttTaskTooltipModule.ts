import { ICalloutProps } from "@fluentui/react";
import { ITaskTooltipProps } from "../../gantt-timeline/components";
import { IGanttServiceLocator } from "../../services";
import { GanttTaskTooltipComponents } from "./moduleComponents";

/** Every component the task-tooltip module renders. Override any subset through the module's `components`. */
export interface IGanttTaskTooltipComponents {
    /** Where the tooltip lives. What the timeline renders while this module is registered. */
    onRenderTooltipLayer: () => JSX.Element;
    /** The callout it is shown in. */
    onRenderCallout: (props: ICalloutProps) => JSX.Element;
    /**
     * The tooltip itself, with everything already read off the task and formatted — the name, the dates,
     * the duration and the status colour. Override this to show something else in the same place.
     */
    onRenderTooltip: (props: ITaskTooltipProps) => JSX.Element;
}

/** What the task-tooltip module contributes. Built by {@link createGanttTaskTooltipModule}. */
export interface IGanttTaskTooltipModule {
    /** The module's UI. */
    components: IGanttTaskTooltipComponents;
}

/** Options for {@link createGanttTaskTooltipModule}. */
export interface IGanttTaskTooltipModuleOptions {
    /** The Gantt's own locator, from `IGanttModuleOptions.onGetModules`. */
    services: IGanttServiceLocator;
    /** Replaces the module's UI. Anything omitted keeps the component the module ships. */
    components?: Partial<IGanttTaskTooltipComponents>;
}

/**
 * Builds the Gantt's task-tooltip module: hovering a bar shows what the task is and when it runs, and a bar
 * being dragged keeps its tooltip while it moves.
 *
 * Assign it to `taskTooltip` on the Gantt's `onGetModules`. Without it the timeline says nothing on hover.
 *
 * @example
 * ```ts
 * createGanttModule({
 *     fieldMapping,
 *     services,
 *     onGetModules: ({ services }) => ({
 *         taskTooltip: createGanttTaskTooltipModule({ services }),
 *     }),
 * })
 * ```
 */
export const createGanttTaskTooltipModule = (options: IGanttTaskTooltipModuleOptions): IGanttTaskTooltipModule => {
    return { components: { ...GanttTaskTooltipComponents, ...options.components } };
};
