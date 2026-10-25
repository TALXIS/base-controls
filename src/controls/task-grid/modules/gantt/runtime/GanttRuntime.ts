import type { GanttStatic } from "gantt-trial";
import type { GridApi } from "ag-grid-community";
import { EventEmitter, IRecord } from "@talxis/client-libraries";
import { HookRegistry, ILocalizationService, IStateStore, LocalizationService, ServiceLocator } from "@utils";
import type { IRibbonCommand } from "@controls/ribbon";
import type { IGrid } from "@controls/grid";
import type { IDatasetControlRuntime } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import type { ITaskGridServiceMap } from "../../../services";
import type { ITaskRuntime } from "../../../runtime";
import { GANTT_LABELS, IGanttLabels } from "../labels";
import type { GanttChartConfigHook, IGantt, IGanttEvents, IGanttModule, IGanttModuleMap, IGanttServiceMap } from "../interfaces";
import { GanttSurfaces } from "../surfaces";
import { GanttTheme } from "../theme";
import { createChart } from "../chart/createChart";
import { GanttDates } from "../dates/GanttDates";
import { GanttTimeline } from "../timeline/GanttTimeline";
import { GanttZooming } from "../zooming/GanttZooming";
import { GanttDragging } from "../dragging/GanttDragging";
import { GanttTasks } from "../tasks/GanttTasks";
import type { ITaskGanttProps } from "../TaskGantt";
import { GanttScrollSync } from "../sync/GanttScrollSync";

export interface IGanttRuntimeParameters {
    datasetControl: IDatasetControlRuntime;
    taskRuntime: ITaskRuntime;
    state: IStateStore;
    onGetProps: () => ITaskGanttProps;
}

export class GanttRuntime implements IGantt {
    public readonly events = new EventEmitter<IGanttEvents>();
    public readonly services = new ServiceLocator<IGanttServiceMap>();
    public readonly modules = new ServiceLocator<IGanttModuleMap>();
    public readonly surfaces = new GanttSurfaces();
    public readonly theme = new GanttTheme();
    private _datasetControl: IDatasetControlRuntime;
    private _taskRuntime: ITaskRuntime;
    private _onGetProps: () => ITaskGanttProps;
    private _loadedModules: { module: IGanttModule; instance: unknown }[] = [];
    private _chartConfigHooks = new HookRegistry<GanttChartConfigHook>();
    private _destroyables: { destroy(): void }[] = [];
    private _unregisterCommands?: () => void;
    private _gantt?: GanttStatic;
    private _zooming?: GanttZooming;
    private _isDestroyed = false;

    constructor(parameters: IGanttRuntimeParameters) {
        this._datasetControl = parameters.datasetControl;
        this._taskRuntime = parameters.taskRuntime;
        this._onGetProps = parameters.onGetProps;
        const labels = new LocalizationService<IGanttLabels>({ ...GANTT_LABELS, ...parameters.onGetProps().labels });
        const dates = new GanttDates(parameters.taskRuntime);
        this.services.register('taskRuntime', () => parameters.taskRuntime);
        this.services.register('labels', () => labels);
        this.services.register('theme', () => this.theme);
        this.services.register('state', () => parameters.state);
        this.services.register('dates', () => dates);
        this._datasetControl.parts.whenAvailable('ribbon', ribbon => this._unregisterCommands = ribbon.registerCommands(this._addCommands));
    }

    public getProps(): ITaskGanttProps {
        return this._onGetProps();
    }

    public getTaskRuntime(): ITaskRuntime {
        return this._taskRuntime;
    }

    public getLabels(): ILocalizationService<IGanttLabels> {
        return this.services.get('labels');
    }

    public registerChartConfig(hook: GanttChartConfigHook, priority?: number): () => void {
        return this._chartConfigHooks.register(hook, priority);
    }

    public render(): void {
        this._gantt?.render();
    }

    /** Loads the modules, then draws the chart into the container once the grid beside it is ready. */
    public async mount(container: HTMLElement): Promise<void> {
        await this._loadModules();
        if (this._isDestroyed) {
            return;
        }
        this._datasetControl.parts.whenAvailable('grid', grid => {
            const taskGrid = grid as IGrid<ITaskGridServiceMap>;
            taskGrid.services.whenAvailable('gridApi', gridApi => {
                if (!this._isDestroyed && !this._gantt) {
                    this._draw(container, taskGrid, gridApi);
                }
            });
        });
    }

    public destroy(): void {
        this._isDestroyed = true;
        this.events.dispatchEvent('onDestroyed');
        this._unregisterCommands?.();
        this._destroyables.forEach(destroyable => destroyable.destroy());
        for (const { module, instance } of this._loadedModules) {
            module.onDestroy?.(instance as never);
        }
        this._gantt?.destructor();
        this.events.clearEventListeners();
        this.services.destroy();
        this.modules.destroy();
    }

    private async _loadModules(): Promise<void> {
        const names = new Set<string>();
        for (const module of this._onGetProps().modules ?? []) {
            if (names.has(module.name)) {
                throw new Error(`Gantt module "${module.name}" is registered twice.`);
            }
            names.add(module.name);
            const instance = await module.onLoad(this);
            this._loadedModules.push({ module, instance });
            this.modules.register(module.name, () => instance as IGanttModuleMap[typeof module.name]);
        }
    }

    //parts and module hooks configure the chart before init; services exist only after it
    private _draw(container: HTMLElement, grid: IGrid<ITaskGridServiceMap>, gridApi: GridApi<IRecord>): void {
        const gantt = createChart({
            rowHeight: grid.services.get('settings').getDefaultRowHeight(),
            scaleHeight: grid.services.get('viewport').getHeaderHeight(),
        });
        this._gantt = gantt;
        const dates = this.services.get('dates');
        const timeline = new GanttTimeline(gantt);
        const dragging = new GanttDragging(gantt);
        const zooming = new GanttZooming({ gantt, taskRuntime: this._taskRuntime, dates, timeline, state: this.services.get('state') });
        const tasks = new GanttTasks({ gantt, gridApi, runtime: this, dates, onParsed: this._onTasksParsed });
        this._zooming = zooming;
        this._destroyables.push(timeline, tasks);
        this._chartConfigHooks.apply(gantt);
        gantt.init(container);

        this.services.register('chart', () => gantt);
        this.services.register('timeline', () => timeline);
        this.services.register('dragging', () => dragging);
        this.services.register('zooming', () => zooming);
        this.services.register('grid', () => grid);
        this.services.register('tasks', () => tasks);
        tasks.parse();
        this._destroyables.push(new GanttScrollSync(gantt, gridApi, grid.services.get('viewport')));
        this.events.dispatchEvent('onChartReady', gantt);
        this._datasetControl.parts.find('ribbon')?.reload();
    }

    private _onTasksParsed = (isFirstLoad: boolean): void => {
        if (isFirstLoad) {
            this._restoreZoomOnceSized();
        }
        this.events.dispatchEvent('onTasksParsed', isFirstLoad);
    };

    //a fit measures the viewport, which is 0 wide until a hidden or opening pane is laid out
    private _restoreZoomOnceSized(): void {
        const taskArea = this._gantt?.$task;
        if (!taskArea || taskArea.offsetWidth > 0) {
            this._zooming?.restore();
            return;
        }
        const observer = new ResizeObserver(() => {
            if (taskArea.offsetWidth > 0) {
                observer.disconnect();
                this._zooming?.restore();
            }
        });
        observer.observe(taskArea);
        this._destroyables.push({ destroy: () => observer.disconnect() });
    }

    private _addCommands = (commands: IRibbonCommand[]): void => {
        const labels = this.getLabels();
        const isDisabled = !this.services.find('zooming');
        commands.push(
            { id: 'ganttZoomToFit', label: labels.getLocalizedString('zoomToFit'), iconName: 'ZoomToFit', isDisabled, onExecute: () => this.services.get('zooming').zoomToFit() },
            { id: 'ganttGoToToday', label: labels.getLocalizedString('goToToday'), iconName: 'GotoToday', isDisabled, onExecute: () => this.services.get('timeline').jumpToToday() },
        );
    };
}
