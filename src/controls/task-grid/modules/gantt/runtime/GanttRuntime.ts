import type { GanttStatic } from "dhtmlx-gantt";
import dayjs from "dayjs";
import type { GridApi } from "ag-grid-community";
import { EventEmitter, IRecord } from "@talxis/client-libraries";
import { HookRegistry, ILabels, ILabelSet, IStateStore, Labels, LocalizationService, ServiceLocator } from "@utils";
import type { IRibbonCommand } from "@controls/ribbon";
import type { GridCellCommandsHook, IGrid } from "@controls/grid";
import type { ITaskGridServiceMap } from "../../../services";
import type { ITaskRuntime } from "../../../runtime";
import type { IDatasetControl } from "@controls/dataset-control/runtime";
import type { ITaskViewData } from "../../../provider";
import { TASK_GRID_PRIORITY } from "../../../priorities";
import { GANTT_LABELS } from "../labels";
import type { GanttChartConfigHook, IGantt, IGanttEvents, IGanttModule, IGanttModuleMap, IGanttServiceMap } from "../interfaces";
import { GanttSurfaces } from "../surfaces";
import { GanttTheme } from "../theme";
import { GanttSchedule, IGanttSpan } from "../schedule/GanttSchedule";
import { GanttTimeline } from "../timeline/GanttTimeline";
import { GanttZooming } from "../zooming/GanttZooming";
import { GanttDragging } from "../dragging/GanttDragging";
import { GanttTasks } from "../tasks/GanttTasks";
import type { ITaskGanttProps } from "../TaskGantt";
import type { IGanttLibrary } from "../modules/library";

const DEFAULT_TIMELINE_LIMIT_YEARS = 25;

export interface IGanttRuntimeParameters {
    taskRuntime: ITaskRuntime;
    state: IStateStore;
    localization: LocalizationService;
    onGetProps: () => ITaskGanttProps;
}

export class GanttRuntime implements IGantt {
    public readonly events = new EventEmitter<IGanttEvents>();
    public readonly services = new ServiceLocator<IGanttServiceMap>();
    public readonly modules = new ServiceLocator<IGanttModuleMap>();
    public readonly surfaces = new GanttSurfaces();
    public readonly theme = new GanttTheme();
    private _taskRuntime: ITaskRuntime;
    private _onGetProps: () => ITaskGanttProps;
    private _loadedModules: { module: IGanttModule; instance: unknown }[] = [];
    private _chartConfigHooks = new HookRegistry<GanttChartConfigHook>();
    private _destroyables: { destroy(): void }[] = [];
    private _unregisterCommands?: () => void;
    private _unregisterCellCommands?: () => void;
    private _gantt?: GanttStatic;
    private _zooming?: GanttZooming;
    private _isDestroyed = false;

    constructor(parameters: IGanttRuntimeParameters) {
        this._taskRuntime = parameters.taskRuntime;
        this._onGetProps = parameters.onGetProps;
        this.services.register('taskRuntime', () => parameters.taskRuntime);
        this.services.register('localization', () => parameters.localization);
        this.services.register('theme', () => this.theme);
        this.services.register('state', () => parameters.state);
        const schedule = new GanttSchedule(this);
        this.services.register('schedule', () => schedule);
        this._datasetControl.parts.whenAvailable('ribbon', ribbon => this._unregisterCommands = ribbon.registerCommands(this._addCommands));
    }

    public getProps(): ITaskGanttProps {
        return this._onGetProps();
    }

    public getTaskRuntime(): ITaskRuntime {
        return this._taskRuntime;
    }

    public getLabels<T extends Labels>(set: ILabelSet<T>): ILabels<T> {
        return this.services.get('localization').getLabels(set);
    }

    public getLibrary(): IGanttLibrary {
        return this.modules.get('library');
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
        this._unregisterCellCommands?.();
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
        const modules = this._onGetProps().modules ?? [];
        const library = modules.find(module => module.name === 'library');
        if (!library) {
            throw new Error('TaskGantt needs a library module: createGanttLibraryModule() or createGanttProLibraryModule(Gantt).');
        }
        const names = new Set<string>();
        //other modules read the library as they load
        for (const module of [library, ...modules.filter(module => module !== library)]) {
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
        const gantt = this._createChart(grid);
        this._gantt = gantt;
        const schedule = this.services.get('schedule');
        const timeline = new GanttTimeline({ gantt, onGetLimits: () => this._getTimelineLimits() });
        const dragging = new GanttDragging(gantt);
        const zooming = new GanttZooming({ gantt, taskRuntime: this._taskRuntime, schedule, timeline, state: this.services.get('state') });
        const tasks = new GanttTasks({ gantt, gridApi, runtime: this, schedule, onParsed: this._onTasksParsed });
        this._zooming = zooming;
        this._destroyables.push(timeline, zooming, tasks);
        this._chartConfigHooks.apply(gantt);
        gantt.init(container);

        this.services.register('chart', () => gantt);
        this.services.register('timeline', () => timeline);
        this.services.register('dragging', () => dragging);
        this.services.register('zooming', () => zooming);
        this.services.register('grid', () => grid);
        this.services.register('tasks', () => tasks);
        tasks.parse();
        this.events.dispatchEvent('onChartReady', gantt);
        this._datasetControl.parts.find('ribbon')?.reload();
        this._unregisterCellCommands = grid.services.get('cells').registerCellCommands(this._onCellCommands, TASK_GRID_PRIORITY.tree + 40);
        gridApi.refreshCells({ columns: [this._taskRuntime.getFieldMapping().subject], force: true });
    }

    //a task with either date has somewhere on the timeline to show
    private _onCellCommands: GridCellCommandsHook = (result, { record, columnName }) => {
        const schedule = this.services.get('schedule');
        if (columnName !== this._taskRuntime.getFieldMapping().subject || !this._taskRuntime.getProvider().getRecordsMap()[record.getRecordId()] || (!schedule.getDate(record, 'start') && !schedule.getDate(record, 'end'))) {
            return;
        }
        const label = this.getLabels(GANTT_LABELS).get('gantt.showTask');
        result.items.push({ key: 'showOnTimeline', text: label, iconProps: { iconName: 'Timeline' }, iconOnly: true, title: label, ariaLabel: label, onClick: () => this._zooming?.showTask(record) });
    };

    //every feature starts off until a part or module turns it on
    private _createChart(grid: IGrid<ITaskGridServiceMap>): GanttStatic {
        const gantt = this.getLibrary().Gantt.getGanttInstance();
        gantt.config.show_grid = false;
        gantt.config.select_task = false;
        gantt.config.details_on_dblclick = false;
        gantt.config.show_unscheduled = true;
        gantt.config.show_tasks_outside_timescale = true;
        gantt.config.task_scroll_offset = 200;
        //otherwise each parse, such as on every expand, scrolls to the first task
        gantt.config.initial_scroll = false;
        gantt.config.show_links = false;
        gantt.config.drag_links = false;
        gantt.config.drag_move = false;
        gantt.config.drag_resize = false;
        gantt.config.drag_progress = false;
        gantt.config.row_height = grid.services.get('settings').getDefaultRowHeight();
        gantt.config.scale_height = grid.services.get('viewport').getHeaderHeight() || gantt.config.scale_height;
        gantt.config.layout = {
            css: 'gantt_container',
            rows: [
                { cols: [{ view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' }, { view: 'scrollbar', id: 'scrollVer' }] },
                { view: 'scrollbar', id: 'scrollHor' },
            ],
        };
        return gantt;
    }

    private get _datasetControl(): IDatasetControl<ITaskViewData> {
        return this._taskRuntime.services.get('datasetControl');
    }

    private _getTimelineLimits(): IGanttSpan {
        const limits = this.getProps().timelineLimits;
        const start = (limits?.start ?? dayjs().subtract(DEFAULT_TIMELINE_LIMIT_YEARS, 'year')).toDate();
        const end = (limits?.end ?? dayjs().add(DEFAULT_TIMELINE_LIMIT_YEARS, 'year')).toDate();
        const tasks = this.services.get('schedule').getRange(Object.values(this._taskRuntime.getProvider().getRecordsMap()));
        if (!tasks) {
            return { start, end };
        }
        return { start: tasks.start < start ? tasks.start : start, end: tasks.end > end ? tasks.end : end };
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
        const labels = this.getLabels(GANTT_LABELS);
        const isDisabled = !this.services.find('zooming');
        commands.push(
            { id: 'ganttZoomToFit', label: labels.get('gantt.zoomToFit'), iconName: 'ZoomToFit', isDisabled, onExecute: () => this.services.get('zooming').zoomToFit() },
            { id: 'ganttGoToToday', label: labels.get('gantt.goToToday'), iconName: 'GotoToday', isDisabled, onExecute: () => this.services.get('timeline').jumpToToday() },
        );
    };
}
