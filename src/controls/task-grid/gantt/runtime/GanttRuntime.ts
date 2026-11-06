import type { GanttStatic } from "dhtmlx-gantt";
import dayjs from "dayjs";
import type { GridApi } from "ag-grid-community";
import { EventEmitter, IRecord } from "@talxis/client-libraries";
import { HookRegistry, IServiceLocator, IStateStore, ModuleLoader, ServiceLocator } from "@core";
import { ILabels, ILabelSet, Labels, LabelsService } from "@labels";
import type { IRibbonCommand } from "@controls/ribbon";
import type { GridCellCommandsHook, IGrid } from "@controls/grid";
import type { ITaskGridServiceMap } from "../../services";
import type { ITaskRuntime } from "../../runtime";
import type { IDatasetControl } from "@controls/dataset-control/runtime";
import type { ITaskViewData } from "../../runtime/provider";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { GANTT_LABELS } from "../labels";
import type { GanttChartConfigHook, IGantt, IGanttEvents, IGanttModuleMap, IGanttServiceMap } from "../interfaces";
import { GanttSurfaces } from "../surfaces";
import { GanttTheme } from "../theme";
import { GanttSchedule, IGanttSpan } from "../schedule";
import { GanttTimeline } from "../timeline";
import { GanttZooming } from "../zooming";
import { GanttDragging } from "../dragging";
import { GanttTasks } from "../tasks";
import { GanttOverlay } from "../overlay";
import { GANTT_CONTAINER_CLASS } from "../chart";
import type { ITaskGanttProps } from "../TaskGantt";
import type { ILibrary } from "../modules/library";

const DEFAULT_TIMELINE_LIMIT_YEARS = 25;

export interface IGanttRuntimeParameters {
    taskRuntime: ITaskRuntime;
    state: IStateStore;
    getLabelsService: () => LabelsService;
    getProps: () => ITaskGanttProps;
}

export class GanttRuntime implements IGantt {
    public readonly events = new EventEmitter<IGanttEvents>();
    public readonly services = new ServiceLocator<IGanttServiceMap>();
    public readonly surfaces = new GanttSurfaces();
    public readonly theme = new GanttTheme();
    private _taskRuntime: ITaskRuntime;
    private _datasetControl: IDatasetControl<ITaskViewData>;
    private _getProps: () => ITaskGanttProps;
    private _moduleLoader = new ModuleLoader<IGanttModuleMap, IGantt>();
    public readonly hooks = {
        chartConfig: new HookRegistry<GanttChartConfigHook>(),
    };
    private _destroyables: { destroy(): void }[] = [];
    private _removeCellCommandsHook?: () => void;
    private _unsubscribes: (() => void)[] = [];
    private _gridApi?: GridApi<IRecord>;
    private _taskRange?: IGanttSpan;
    private _isTaskRangeStale = true;
    private _isDestroyed = false;

    public get modules(): IServiceLocator<IGanttModuleMap> {
        return this._moduleLoader.modules;
    }

    constructor(parameters: IGanttRuntimeParameters) {
        this._taskRuntime = parameters.taskRuntime;
        this._datasetControl = parameters.taskRuntime.services.get('datasetControl');
        this._getProps = parameters.getProps;
        this.services.register('taskRuntime', () => parameters.taskRuntime);
        this.services.register('labels', parameters.getLabelsService);
        this.services.register('theme', () => this.theme);
        this.services.register('state', () => parameters.state);
        const schedule = new GanttSchedule(this);
        this.services.register('schedule', () => schedule);
        const overlay = new GanttOverlay(parameters.taskRuntime.getProvider());
        this.services.register('overlay', () => overlay);
        this._destroyables.push(overlay);
        this._unsubscribes.push(this._datasetControl.parts.observe('ribbon', ribbon => ribbon.hooks.commands.add(this._addCommands)));
    }

    public getProps(): ITaskGanttProps {
        return this._getProps();
    }

    public getTaskRuntime(): ITaskRuntime {
        return this._taskRuntime;
    }

    public getLabels<T extends Labels>(set: ILabelSet<T>): ILabels<T> {
        return this.services.get('labels').getLabels(set);
    }

    public getLibrary(): ILibrary {
        return this.modules.get('library');
    }

    public render(): void {
        this.services.find('chart')?.render();
    }

    /** Loads the modules and draws the chart once the grid beside it is ready. */
    public async mount(container: HTMLElement): Promise<void> {
        await this._loadModules();
        if (this._isDestroyed) {
            return;
        }
        this._unsubscribes.push(this._datasetControl.parts.observe('grid', grid => {
            const taskGrid = grid as IGrid<ITaskGridServiceMap>;
            return taskGrid.services.observe('gridApi', gridApi => {
                if (!this.services.find('chart')) {
                    this._draw(container, taskGrid, gridApi);
                }
            });
        }));
    }

    public destroy(): void {
        this._isDestroyed = true;
        this.events.dispatchEvent('onDestroyed');
        this._unsubscribes.forEach(unsubscribe => unsubscribe());
        this._datasetControl.parts.find('ribbon')?.reload();
        this._removeCellCommandsHook?.();
        if (this._removeCellCommandsHook && this._gridApi && !this._gridApi.isDestroyed()) {
            this._gridApi.refreshCells({ columns: [this._taskRuntime.getFieldMapping().subject], force: true });
        }
        this._destroyables.forEach(destroyable => destroyable.destroy());
        this._moduleLoader.destroy();
        this.services.find('chart')?.destructor();
        this.services.destroy();
    }

    private async _loadModules(): Promise<void> {
        const modules = this._getProps().modules;
        if (!modules.some(module => module.name === 'library')) {
            throw new Error('TaskGantt needs a library module: createLibraryModule() or createProLibraryModule({ Gantt }).');
        }
        await this._moduleLoader.load(modules, this);
    }

    //config hooks run before init and the services register after it
    private _draw(container: HTMLElement, grid: IGrid<ITaskGridServiceMap>, gridApi: GridApi<IRecord>): void {
        const chart = this._createChart(grid);
        this._gridApi = gridApi;
        const schedule = this.services.get('schedule');
        const timeline = new GanttTimeline({ chart, getLimits: () => this._getTimelineLimits() });
        const dragging = new GanttDragging(chart);
        const zooming = new GanttZooming({ chart, taskRuntime: this._taskRuntime, schedule, timeline, state: this.services.get('state') });
        const tasks = new GanttTasks({ chart, gridApi, gantt: this, schedule, onParsed: this._onTasksParsed });
        this._destroyables.push(timeline, zooming, tasks);
        this.hooks.chartConfig.apply(chart);
        chart.init(container);

        this.services.register('chart', () => chart);
        this.services.register('timeline', () => timeline);
        this.services.register('dragging', () => dragging);
        this.services.register('zooming', () => zooming);
        this.services.register('grid', () => grid);
        this.services.register('tasks', () => tasks);
        this._watchTaskRange();
        tasks.parse();
        this.events.dispatchEvent('onChartReady', chart);
        this._datasetControl.parts.find('ribbon')?.reload();
        this._removeCellCommandsHook = grid.services.get('cells').hooks.commands.add(this._onCellCommands, TASK_GRID_PRIORITY.tree + 40);
        gridApi.refreshCells({ columns: [this._taskRuntime.getFieldMapping().subject], force: true });
    }

    //a task with either date has somewhere on the timeline to show
    private _onCellCommands: GridCellCommandsHook = (result, { record, columnName }) => {
        const schedule = this.services.get('schedule');
        if (columnName !== this._taskRuntime.getFieldMapping().subject || !this._taskRuntime.getProvider().getRecordsMap()[record.getRecordId()] || (!schedule.getDate(record, 'start') && !schedule.getDate(record, 'end'))) {
            return;
        }
        const label = this.getLabels(GANTT_LABELS).get('gantt.showTask');
        result.items.push({ key: 'showOnTimeline', text: label, iconProps: { iconName: 'Timeline' }, iconOnly: true, title: label, ariaLabel: label, onClick: () => this.services.find('zooming')?.showTask(record) });
    };

    //every feature starts off until a part or module turns it on
    private _createChart(grid: IGrid<ITaskGridServiceMap>): GanttStatic {
        const chart = this.getLibrary().Gantt.getGanttInstance();
        chart.config.show_grid = false;
        chart.config.select_task = false;
        chart.config.details_on_dblclick = false;
        chart.config.show_unscheduled = true;
        chart.config.show_tasks_outside_timescale = true;
        chart.config.task_scroll_offset = 200;
        //otherwise every parse scrolls to the first task
        chart.config.initial_scroll = false;
        chart.config.show_links = false;
        chart.config.drag_links = false;
        chart.config.drag_move = false;
        chart.config.drag_resize = false;
        chart.config.drag_progress = false;
        chart.config.row_height = grid.services.get('settings').getDefaultRowHeight();
        chart.config.scale_height = grid.services.get('viewport').getHeaderHeight() || chart.config.scale_height;
        chart.config.layout = {
            css: GANTT_CONTAINER_CLASS,
            rows: [
                { cols: [{ view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' }, { view: 'scrollbar', id: 'scrollVer' }] },
                { view: 'scrollbar', id: 'scrollHor' },
            ],
        };
        return chart;
    }

    private _getTimelineLimits(): IGanttSpan {
        const limits = this.getProps().timelineLimits;
        const start = (limits?.start ?? dayjs().subtract(DEFAULT_TIMELINE_LIMIT_YEARS, 'year')).toDate();
        const end = (limits?.end ?? dayjs().add(DEFAULT_TIMELINE_LIMIT_YEARS, 'year')).toDate();
        const tasks = this._getTaskRange();
        if (!tasks) {
            return { start, end };
        }
        return { start: tasks.start < start ? tasks.start : start, end: tasks.end > end ? tasks.end : end };
    }

    //called on every zoom and scroll step
    private _getTaskRange(): IGanttSpan | undefined {
        if (this._isTaskRangeStale) {
            const chartTasks = this.services.find('tasks');
            const records = chartTasks?.getTaskIds().map(taskId => chartTasks.getRecord(taskId)).filter((record): record is IRecord => !!record) ?? [];
            this._taskRange = this.services.get('schedule').getRange(records);
            this._isTaskRangeStale = !chartTasks;
        }
        return this._taskRange;
    }

    private _watchTaskRange(): void {
        const provider = this._taskRuntime.getProvider();
        this._unsubscribes.push(
            provider.addEventListener('onRecordColumnValueChanged', this._invalidateTaskRange),
            provider.taskEvents.addEventListener('onTasksUpdated', this._invalidateTaskRange),
        );
    }

    private _invalidateTaskRange = (): void => {
        this._isTaskRangeStale = true;
    };

    private _onTasksParsed = (isFirstLoad: boolean): void => {
        this._isTaskRangeStale = true;
        if (isFirstLoad) {
            this._restoreZoomOnceSized();
        }
        this.events.dispatchEvent('onTasksParsed', isFirstLoad);
    };

    //a fit needs a viewport laid out with a width
    private _restoreZoomOnceSized(): void {
        const taskArea = this.services.find('chart')?.$task;
        const timeline = this.services.find('timeline');
        const zooming = this.services.find('zooming');
        if (!taskArea || !timeline || timeline.getViewportWidth() > 0) {
            zooming?.restore();
            return;
        }
        const observer = new ResizeObserver(() => {
            if (timeline.getViewportWidth() > 0) {
                observer.disconnect();
                zooming?.restore();
            }
        });
        observer.observe(taskArea);
    }

    private _addCommands = (commands: IRibbonCommand[]): void => {
        const labels = this.getLabels(GANTT_LABELS);
        const isDisabled = !this.services.find('zooming');
        commands.push(
            { id: 'ganttZoomToFit', label: labels.get('gantt.zoomToFit'), iconName: 'ZoomToFit', disabled: isDisabled, onExecute: () => this.services.get('zooming').zoomToFit() },
            { id: 'ganttGoToToday', label: labels.get('gantt.goToToday'), iconName: 'GotoToday', disabled: isDisabled, onExecute: () => this.services.get('timeline').jumpToToday() },
        );
    };
}
