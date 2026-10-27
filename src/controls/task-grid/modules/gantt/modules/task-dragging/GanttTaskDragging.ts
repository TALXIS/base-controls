import type { GanttStatic, Task } from "dhtmlx-gantt";
import type { IGantt } from "../../interfaces";
import { GANTT_TASK_LINE_CLASS } from "../../chart/classNames";
import type { GanttSpanEdge, IGanttSpan } from "../../schedule/GanttSchedule";
import { getGanttTaskDraggingStyles } from "./styles";
import { getTaskDragState, shiftTaskDrag } from "./taskDragState";

const MOVE_MODE = 'move';
const RESIZE_MODE = 'resize';

export interface IGanttTaskDraggingParameters {
    /** Dragging a bar to other dates. Defaults to `true`. */
    enableMove?: boolean;
    /** Dragging a bar's ends to change its duration. Defaults to `true`. */
    enableResize?: boolean;
}

/** The `taskDragging` module: moves and resizes bars, writing the dates once the bar is dropped. */
export interface IGanttTaskDragging {
    isMoveEnabled(): boolean;
    isResizeEnabled(): boolean;
    /** Called as the Gantt goes. */
    destroy(): void;
}

export class GanttTaskDragging implements IGanttTaskDragging {
    private _gantt: IGantt;
    private _isMoveEnabled: boolean;
    private _isResizeEnabled: boolean;
    private _unregisters: (() => void)[] = [];

    constructor(gantt: IGantt, parameters: IGanttTaskDraggingParameters) {
        this._gantt = gantt;
        this._isMoveEnabled = parameters.enableMove ?? true;
        this._isResizeEnabled = parameters.enableResize ?? true;
        this._unregisters.push(
            gantt.registerChartConfig(this._configureChart),
            gantt.services.get('theme').registerStyles(result => result.styles.push(getGanttTaskDraggingStyles())),
        );
        gantt.services.whenAvailable('chart', this._onChartReady);
    }

    public isMoveEnabled(): boolean {
        return this._isMoveEnabled;
    }

    public isResizeEnabled(): boolean {
        return this._isResizeEnabled;
    }

    public destroy(): void {
        document.removeEventListener('mouseup', this._onPointerUp);
        this._unregisters.forEach(unregister => unregister());
    }

    private _configureChart = (chart: GanttStatic): void => {
        chart.config.drag_move = this._isMoveEnabled;
        chart.config.drag_resize = this._isResizeEnabled;
        chart.config.round_dnd_dates = false;
        //a moved bar's end is set from its duration on drop, which whole days would round
        chart.config.duration_unit = 'minute';
    };

    private _onChartReady = (chart: GanttStatic): void => {
        chart.attachEvent('onBeforeTaskDrag', this._onBeforeTaskDrag);
        chart.attachEvent('onTaskDrag', this._onTaskDrag);
        chart.attachEvent('onBeforeTaskChanged', this._onBeforeTaskChanged);
        chart.attachEvent('onAfterTaskDrag', this._onAfterTaskDrag);
        //captured: the chart measures the bar in its own mousedown
        chart.$root.addEventListener('mousedown', this._onPointerDown, true);
        document.addEventListener('mouseup', this._onPointerUp);
    };

    private _onPointerDown = (event: MouseEvent): void => {
        const chart = this._gantt.services.find('chart');
        if (!chart || !this._gantt.getTaskRuntime().isEditingEnabled() || !(event.target as HTMLElement | null)?.closest(`.${GANTT_TASK_LINE_CLASS}`)) {
            return;
        }
        const taskId = chart.locate(event);
        const task = taskId && chart.isTaskExists(taskId) ? chart.getTask(taskId) : undefined;
        if (task?.start_date && task.end_date) {
            this._gantt.services.get('timeline').fitRangeTo(task.start_date, task.end_date);
        }
    };

    private _onPointerUp = (): void => {
        this._gantt.services.find('timeline')?.restoreRange();
    };

    private _onBeforeTaskDrag = (id: string | number, mode: string): boolean => {
        const taskRuntime = this._gantt.getTaskRuntime();
        if (!taskRuntime.isEditingEnabled() || this._gantt.services.get('tasks').isLocked(String(id))) {
            return false;
        }
        const isEnabled = mode === RESIZE_MODE ? this._isResizeEnabled : this._isMoveEnabled;
        if (isEnabled) {
            this._configureSnapping();
        }
        return isEnabled;
    };

    //the chart's own rounding on drop and its shortest bar follow the same steps
    private _configureSnapping(): void {
        const chart = this._gantt.services.get('chart');
        const schedule = this._gantt.services.get('schedule');
        chart.config.time_step = Math.min(schedule.getSnapMinutes('start'), schedule.getSnapMinutes('end'));
        chart.config.min_duration = schedule.getSnapMinutes('end') * 60_000;
    }

    private _onTaskDrag = (id: string | number, mode: string, task: Task): void => {
        const chart = this._gantt.services.get('chart');
        const timeline = this._gantt.services.get('timeline');
        this._snap(task, mode);
        //lets the bar travel past either end of what is drawn
        if (task.end_date) {
            timeline.extendRangeEnd(task.end_date);
        }
        if (task.start_date) {
            shiftTaskDrag(chart, timeline.extendRangeStart(task.start_date));
        }
    };

    //after the chart's own rounding, so the dropped dates follow the same steps as the drag
    private _onBeforeTaskChanged = (id: string | number, mode: string): boolean => {
        this._snap(this._gantt.services.get('chart').getTask(id), mode);
        return true;
    };

    private _snap(task: Task, mode: string): void {
        const drag = getTaskDragState(this._gantt.services.get('chart'));
        const span = toSpan(task);
        const original = drag?.obj && toSpan(drag.obj);
        if (!drag || !span || !original || (mode !== MOVE_MODE && mode !== RESIZE_MODE)) {
            return;
        }
        const schedule = this._gantt.services.get('schedule');
        const edge: GanttSpanEdge = drag.left ? 'start' : 'end';
        const snapped = mode === MOVE_MODE ? schedule.snapMove(span, original) : schedule.snapEdge(span, edge);
        task.start_date = snapped.start;
        task.end_date = snapped.end;
    }

    private _onAfterTaskDrag = (id: string | number): void => {
        const taskId = String(id);
        const span = toSpan(this._gantt.services.get('chart').getTask(taskId));
        const record = this._gantt.services.get('tasks').getRecord(taskId);
        if (record && span) {
            this._gantt.services.get('schedule').save(record, span);
        }
    };
}

const toSpan = (task: Task): IGanttSpan | undefined => task.start_date && task.end_date ? { start: task.start_date, end: task.end_date } : undefined;

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** Moving and resizing bars. */
        taskDragging: IGanttTaskDragging;
    }
}
