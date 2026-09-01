import { LocalizationService } from "@utils";
import { IGanttServiceLocator } from "../../services";
import { GanttMarkersProvider, IGanttMarkersStrategy } from "./GanttMarkersProvider";
import { IGanttMarkerProps } from "./context";
import { GANTT_MARKERS_LABELS, IGanttMarkersLabels } from "./labels";
import { GanttMarkersComponents } from "./moduleComponents";

/** Every component the markers module renders. Override any subset through the module's `components`. */
export interface IGanttMarkersComponents {
    /** One marker's chip on the timeline's scale. */
    onRenderMarker: (props: IGanttMarkerProps) => JSX.Element;
    /** The overlay the chips are drawn into. What the timeline renders while this module is registered. */
    onRenderMarkerLayer: () => JSX.Element;
}

/** What the markers module contributes. Built by {@link createGanttMarkersModule}. */
export interface IGanttMarkersModule {
    /** The module's UI. */
    components: IGanttMarkersComponents;
}

/** Options for {@link createGanttMarkersModule}. */
export interface IGanttMarkersModuleOptions {
    /** The Gantt's own locator, from `IGanttModuleOptions.onGetModules`. */
    services: IGanttServiceLocator;
    /** Draw the line marking today. Defaults to `false`. */
    enableTodayMarker?: boolean;
    /**
     * Draw the project's start and end. Defaults to `false`.
     *
     * The dates come from the project module, so nothing is drawn unless that module is registered too.
     */
    enableProjectMarkers?: boolean;
    /** Where markers of your own come from — a milestone, a release date, a deadline. */
    strategy?: IGanttMarkersStrategy;
    /** Replaces the module's UI. Anything omitted keeps the component the module ships. */
    components?: Partial<IGanttMarkersComponents>;
    /** Overrides for any subset of the module's strings. */
    labels?: Partial<IGanttMarkersLabels>;
}

/**
 * Builds the Gantt's markers module: the today line, the project's boundaries, and whatever your strategy
 * returns, each drawn over the timeline's scale.
 *
 * Assign it to `markers` on the Gantt's `onGetModules`. Registering it is what enables the chart's `marker`
 * plugin — without it a timeline draws no markers at all.
 *
 * @example
 * ```ts
 * createGanttModule({
 *     fieldMapping,
 *     services,
 *     onGetModules: ({ services }) => ({
 *         markers: createGanttMarkersModule({
 *             services,
 *             enableTodayMarker: true,
 *             enableProjectMarkers: true,
 *         }),
 *     }),
 * })
 * ```
 */
export const createGanttMarkersModule = (options: IGanttMarkersModuleOptions): IGanttMarkersModule => {
    const { services } = options;
    const components: IGanttMarkersComponents = { ...GanttMarkersComponents, ...options.components };
    const labels = new LocalizationService<IGanttMarkersLabels>({ ...GANTT_MARKERS_LABELS, ...options.labels });

    //the provider needs a chart, which the manager only creates once the timeline hands over a container -
    //so the module waits for it rather than being built with one
    services.whenAvailable('ganttChart', () => {
        const markers = new GanttMarkersProvider({
            services,
            flags: {
                enableTodayMarker: options.enableTodayMarker ?? false,
                enableProjectMarkers: options.enableProjectMarkers ?? false,
            },
            labels: labels,
            strategy: options.strategy,
        });
        services.register('ganttMarkers', () => markers);
    });

    return { components };
};
