import type { GanttStatic } from "dhtmlx-gantt";
import type { IGantt } from "../../interfaces";
import { GANTT_TASK_LINE_CLASS } from "../../chart/classNames";
import { getGanttTaskDraggingStyles } from "./styles";

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

//the chart's drag state, which it measures from the rendered range's start
interface IGanttDragState {
    start_x?: number;
    pos?: { x: number; y: number };
    obj_s_x?: number;
    obj_e_x?: number;
}

interface IGanttTaskDnd {
    drag: IGanttDragState | null;
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
    };

    private _onChartReady = (chart: GanttStatic): void => {
        chart.attachEvent('onBeforeTaskDrag', this._onBeforeTaskDrag);
        chart.attachEvent('onTaskDrag', this._onTaskDrag);
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
        return mode === RESIZE_MODE ? this._isResizeEnabled : this._isMoveEnabled;
    };

    //lets the bar travel past either end of what is drawn
    private _onTaskDrag = (id: string | number): void => {
        const chart = this._gantt.services.get('chart');
        const timeline = this._gantt.services.get('timeline');
        const task = chart.getTask(id);
        if (task.end_date) {
            timeline.extendRangeEnd(task.end_date);
        }
        if (task.start_date) {
            this._shiftDragCoordinates(chart, timeline.extendRangeStart(task.start_date));
        }
    };

    private _onAfterTaskDrag = (id: string | number): void => {
        const taskId = String(id);
        const task = this._gantt.services.get('chart').getTask(taskId);
        const tasks = this._gantt.services.get('tasks');
        const record = tasks.getRecord(taskId);
        const dates = this._gantt.services.get('dates');
        if (!record || !task.start_date || !task.end_date) {
            return;
        }
        const durationColumnName = this._gantt.getTaskRuntime().getFieldMapping().duration;
        if (durationColumnName) {
            record.setValue(durationColumnName, Math.round(tasks.calculateDuration(task.start_date, task.end_date, record)));
        }
        record.setValue(dates.getStartColumnName(), task.start_date);
        //through the grid's field, so the drop saves as an edit in the grid does
        this._gantt.services.get('grid').services.get('fields').get(record, dates.getEndColumnName()).setValue(task.end_date);
    };

    //no public way to re-base a running drag after the range grew backwards
    private _shiftDragCoordinates(chart: GanttStatic, offset: number): void {
        const taskDnd = (chart as unknown as { _tasks_dnd?: IGanttTaskDnd })._tasks_dnd;
        if (!taskDnd?.drag || !offset) {
            return;
        }
        const drag = taskDnd.drag;
        if (drag.start_x !== undefined) {
            drag.start_x += offset;
        }
        if (drag.pos) {
            drag.pos.x += offset;
        }
        if (drag.obj_s_x !== undefined) {
            drag.obj_s_x += offset;
        }
        if (drag.obj_e_x !== undefined) {
            drag.obj_e_x += offset;
        }
    }
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** Moving and resizing bars. */
        taskDragging: IGanttTaskDragging;
    }
}
