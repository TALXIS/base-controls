import { LocalizationService } from "@utils";
import { IGanttServiceLocator } from "../../services";
import { GanttWeekends } from "./GanttWeekends";
import { GANTT_WEEKENDS_LABELS, IGanttWeekendsLabels } from "./labels";
import { GanttWeekendsComponents } from "./moduleComponents";

/** Every component the weekends module renders. Override any subset through the module's `components`. */
export interface IGanttWeekendsComponents {
    /** The toggle in the grid's settings callout. What that callout shows while this module is registered. */
    onRenderToggle: () => JSX.Element;
}

/** What the weekends module contributes. Built by {@link createGanttWeekendsModule}. */
export interface IGanttWeekendsModule {
    /** The module's UI. */
    components: IGanttWeekendsComponents;
}

/** Options for {@link createGanttWeekendsModule}. */
export interface IGanttWeekendsModuleOptions {
    /** The Gantt's own locator, from `IGanttModuleOptions.onGetModules`. */
    services: IGanttServiceLocator;
    /** Whether weekends start drawn, on a view that says nothing. Defaults to `false`. */
    visibleByDefault?: boolean;
    /** Replaces the module's UI. Anything omitted keeps the component the module ships. */
    components?: Partial<IGanttWeekendsComponents>;
    /** Overrides for any subset of the module's strings. */
    labels?: Partial<IGanttWeekendsLabels>;
}

/**
 * Builds the Gantt's weekends module: weekends drop out of the scale so the bars close up over them, and a
 * toggle in the settings callout puts them back.
 *
 * Assign it to `weekends` on the Gantt's `onGetModules`. **This is the only PRO-licensed thing the Gantt
 * asks of the chart** — hiding time units on the scale is PRO only
 * (https://docs.dhtmlx.com/gantt/guides/custom-scale/), which is why it is a module: a Gantt without it
 * uses nothing outside the Community edition. Weekends are still marked either way, by the timeline itself.
 *
 * @example
 * ```ts
 * createGanttModule({
 *     fieldMapping,
 *     services,
 *     onGetModules: ({ services }) => ({
 *         weekends: createGanttWeekendsModule({ services }),
 *     }),
 * })
 * ```
 */
export const createGanttWeekendsModule = (options: IGanttWeekendsModuleOptions): IGanttWeekendsModule => {
    const { services } = options;
    const components: IGanttWeekendsComponents = { ...GanttWeekendsComponents, ...options.components };
    const labels = new LocalizationService<IGanttWeekendsLabels>({ ...GANTT_WEEKENDS_LABELS, ...options.labels });

    services.register('weekendsLabels', () => labels);
    //there is no scale to take days out of until the manager creates the chart, so the module waits for it
    //rather than being built with one
    services.whenAvailable('ganttChart', () => {
        const weekends = new GanttWeekends({ services, visibleByDefault: options.visibleByDefault ?? false });
        services.register('ganttWeekends', () => weekends);
    });

    return { components };
};
