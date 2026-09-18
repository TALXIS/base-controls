import { LocalizationService } from "@utils";
import { IGanttServiceLocator } from "../../services";
import { GanttMarkersProvider, IGanttMarkerOptions, IGanttMarkersStrategy } from "./GanttMarkersProvider";
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
    /** The line marking today: whether it is drawn, and in what colour. Not drawn by default. */
    todayMarker?: IGanttMarkerOptions;
    /**
     * The project's start and end: whether they are drawn, and in what colour. Not drawn by default.
     *
     * The dates come from the project module, so nothing is drawn unless that module is registered too.
     */
    projectMarkers?: IGanttMarkerOptions;
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
 * Assign it to `markers` on the Gantt's `onGetModules`. It brings the chart's `marker` plugin with it —
 * without this module a timeline draws no markers at all.
 *
 * @example
 * ```ts
 * createGanttModule({
 *     fieldMapping,
 *     services,
 *     onGetModules: ({ services }) => ({
 *         markers: createGanttMarkersModule({
 *             services,
 *             todayMarker: { enabled: true },
 *             projectMarkers: { enabled: true, color: 'rgb(255, 185, 0)' },
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
    services.whenAvailable('ganttChart', gantt => {
        //the only feature that needs an extension loaded, so it loads it: `plugins` adds what is not there
        //yet and leaves the rest alone, and the chart is not drawn until the manager inits it
        gantt.plugins({ marker: true });
        const markers = new GanttMarkersProvider({
            services,
            settings: {
                today: options.todayMarker ?? {},
                project: options.projectMarkers ?? {},
            },
            labels: labels,
            strategy: options.strategy,
        });
        services.register('ganttMarkers', () => markers);
    });

    return { components };
};
