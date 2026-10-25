import type { GanttStatic } from "gantt-trial";
import type { IEventSubscriber, ILocalizationService, IServiceLocator, IStateStore } from "@utils";
import type { IGrid } from "@controls/grid";
import type { ITaskGridServiceMap } from "../../services";
import type { ITaskRuntime } from "../../runtime";
import type { IGanttLabels } from "./labels";
import type { IGanttDates } from "./dates/GanttDates";
import type { IGanttZooming } from "./zooming/GanttZooming";
import type { IGanttTimeline } from "./timeline/GanttTimeline";
import type { IGanttDragging } from "./dragging/GanttDragging";
import type { IGanttTasks } from "./tasks/GanttTasks";
import type { IGanttSurfaces } from "./surfaces";
import type { ITaskGanttProps } from "./TaskGantt";

/** The modules a Gantt loaded, by name; each module adds its own entry. */
export interface IGanttModuleMap { }

/** A feature of the Gantt, loaded on every mount before the chart is drawn. */
export interface IGanttModule<TName extends keyof IGanttModuleMap = keyof IGanttModuleMap> {
    /** Unique within the Gantt; what `onLoad` returns is registered under it. */
    name: TName;
    onLoad(gantt: IGantt): IGanttModuleMap[TName] | Promise<IGanttModuleMap[TName]>;
    /** Called as the Gantt goes, with what `onLoad` returned. */
    onDestroy?(instance: IGanttModuleMap[TName]): void;
}

export type IGanttModuleLocator = Pick<IServiceLocator<IGanttModuleMap>, 'get' | 'find' | 'whenAvailable'>;

/** The services the modules register; a module adds its own by augmenting this. */
export interface IGanttModuleServiceMap { }

export interface IGanttServiceMap extends IGanttModuleServiceMap {
    taskRuntime: ITaskRuntime;
    labels: ILocalizationService<IGanttLabels>;
    /** What the Gantt keeps per view. */
    state: IStateStore;
    /** The chart, there once it is drawn. */
    chart: GanttStatic;
    dates: IGanttDates;
    zooming: IGanttZooming;
    timeline: IGanttTimeline;
    dragging: IGanttDragging;
    /** The grid beside the chart, there once both are drawn. */
    grid: IGrid<ITaskGridServiceMap>;
    /** The chart's tasks, there once the grid is drawn. */
    tasks: IGanttTasks;
}

export type IGanttServiceLocator = IServiceLocator<IGanttServiceMap>;

/** The services there only once the chart, or the module adding them, is. */
export type IGanttDeferredService = keyof IGanttModuleServiceMap | 'chart' | 'zooming' | 'timeline' | 'dragging' | 'grid' | 'tasks';

export interface IGanttEvents {
    /** The chart is drawn, and its services are there. */
    onChartReady: (chart: GanttStatic) => void;
    /** The chart's tasks were rebuilt from the grid's rows. */
    onTasksParsed: (isFirstLoad: boolean) => void;
    onDestroyed: () => void;
}

/** Sets the chart's config, templates and plugins before it is drawn. */
export type GanttChartConfigHook = (chart: GanttStatic) => void;

/** One mount of a `TaskGantt`: what its modules load on and its parts read. */
export interface IGantt {
    readonly events: IEventSubscriber<IGanttEvents>;
    readonly services: IGanttServiceLocator;
    readonly modules: IGanttModuleLocator;
    /** What the modules draw over the chart. */
    readonly surfaces: IGanttSurfaces;
    /** The `TaskGantt`'s props as they are now. */
    getProps(): ITaskGanttProps;
    getTaskRuntime(): ITaskRuntime;
    getLabels(): ILocalizationService<IGanttLabels>;
    /**
     * Registers a hook that sets the chart's config, templates and plugins before it is drawn.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerChartConfig(hook: GanttChartConfigHook, priority?: number): () => void;
    /** Redraws the chart, such as after a hook's answer changed. */
    render(): void;
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlPartMap {
        /** The `TaskGantt` in the body, while one is drawn. */
        gantt: IGantt;
    }
}
