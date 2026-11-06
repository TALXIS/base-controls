import type { GanttStatic, Task } from "dhtmlx-gantt";
import type { IGantt } from "../../interfaces";
import { GANTT_TASK_DRAG_HANDLE_CLASS, GANTT_TASK_LINE_CLASS, getBarDragState, shiftBarDrag } from "../../chart";
import { GanttSpanEdge, IGanttSpan, MILLISECONDS_PER_MINUTE } from "../../schedule";
import { getBarDraggingStyles } from "./styles";

const MOVE_MODE = 'move';
const RESIZE_MODE = 'resize';

export interface IBarDraggingParameters {
    /** Dragging a bar to other dates (default `true`). */
    enableMove?: boolean;
    /** Dragging a bar's ends to change its duration (default `true`). */
    enableResize?: boolean;
}

/** The `barDragging` module: moves and resizes bars, writing the dates once the bar is dropped. */
export interface IBarDragging { }

export class BarDragging implements IBarDragging {
    private _gantt: IGantt;
    private _isMoveEnabled: boolean;
    private _isResizeEnabled: boolean;

    constructor(gantt: IGantt, parameters: IBarDraggingParameters) {
        this._gantt = gantt;
        this._isMoveEnabled = parameters.enableMove ?? true;
        this._isResizeEnabled = parameters.enableResize ?? true;
        gantt.hooks.chartConfig.add(this._configureChart);
        gantt.services.get('theme').hooks.styles.add((result, theme) => result.styles.push(getBarDraggingStyles(theme)));
        gantt.services.observe('chart', this._onChartReady);
    }

    private _configureChart = (chart: GanttStatic): void => {
        chart.config.drag_move = this._isMoveEnabled;
        chart.config.drag_resize = this._isResizeEnabled;
        chart.config.round_dnd_dates = false;
        //minutes keep a dropped bar's end from rounding to whole days
        chart.config.duration_unit = 'minute';
    };

    private _onChartReady = (chart: GanttStatic): (() => void) => {
        chart.attachEvent('onBeforeTaskDrag', this._onBeforeTaskDrag);
        chart.attachEvent('onTaskDrag', this._onTaskDrag);
        chart.attachEvent('onBeforeTaskChanged', this._onBeforeTaskChanged);
        chart.attachEvent('onAfterTaskDrag', this._onAfterTaskDrag);
        //captured since the chart measures the bar in its own mousedown
        chart.$root.addEventListener('mousedown', this._onPointerDown, true);
        document.addEventListener('mouseup', this._onPointerUp);
        return () => document.removeEventListener('mouseup', this._onPointerUp);
    };

    private _onPointerDown = (event: MouseEvent): void => {
        const chart = this._gantt.services.find('chart');
        const target = event.target as HTMLElement | null;
        if (!chart || !target?.closest(`.${GANTT_TASK_LINE_CLASS}`)) {
            return;
        }
        const isEnabled = target.closest(`.${GANTT_TASK_DRAG_HANDLE_CLASS}`) ? this._isResizeEnabled : this._isMoveEnabled;
        const taskId = chart.locate(event);
        const span = taskId && chart.isTaskExists(taskId) ? toSpan(chart.getTask(taskId)) : undefined;
        if (isEnabled && span && this._canDrag(String(taskId))) {
            this._gantt.services.get('timeline').fitRangeTo(span);
        }
    };

    private _onPointerUp = (): void => {
        this._gantt.services.find('timeline')?.restoreRange();
    };

    private _onBeforeTaskDrag = (id: string | number, mode: string): boolean => {
        if (!this._canDrag(String(id))) {
            return false;
        }
        const isEnabled = mode === RESIZE_MODE ? this._isResizeEnabled : this._isMoveEnabled;
        if (isEnabled) {
            this._configureSnapping();
        }
        return isEnabled;
    };

    //a second change would race the one being saved
    private _canDrag(taskId: string): boolean {
        const tasks = this._gantt.services.find('tasks');
        return !!tasks && this._gantt.getTaskRuntime().isEditingEnabled() && !tasks.isLocked(taskId) && !tasks.isSaving(taskId);
    }

    //the chart's own rounding on drop and its shortest bar follow the same steps
    private _configureSnapping(): void {
        const chart = this._gantt.services.get('chart');
        const schedule = this._gantt.services.get('schedule');
        chart.config.time_step = Math.min(schedule.getSnapMinutes('start'), schedule.getSnapMinutes('end'));
        chart.config.min_duration = schedule.getSnapMinutes('end') * MILLISECONDS_PER_MINUTE;
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
            shiftBarDrag(chart, timeline.extendRangeStart(task.start_date));
        }
    };

    //after the chart's own rounding so drops follow the drag's steps
    private _onBeforeTaskChanged = (id: string | number, mode: string): boolean => {
        this._snap(this._gantt.services.get('chart').getTask(id), mode);
        return true;
    };

    private _snap(task: Task, mode: string): void {
        const drag = getBarDragState(this._gantt.services.get('chart'));
        const span = toSpan(task);
        const original = drag?.obj && toSpan(drag.obj);
        if (!drag || !span || !original || (mode !== MOVE_MODE && mode !== RESIZE_MODE)) {
            return;
        }
        const schedule = this._gantt.services.get('schedule');
        const edge: GanttSpanEdge = drag.left ? 'start' : 'end';
        const snapped = mode === MOVE_MODE ? schedule.snapMove(span, original) : schedule.snapEdge(span, edge, original);
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
        barDragging: IBarDragging;
    }
}
