import { GanttStatic } from 'gantt-trial';
import { ITaskDataProvider } from '@components/TaskGrid/providers';
import { ITaskGridServiceLocator } from '@components/TaskGrid/services';
import { IGanttFieldMapping, IGanttServiceLocator } from '../../services';
import { GANTT_TASK_LINE_CLASS } from '../../classNames';
import { IGanttDates } from '../../gantt-dates';
import { IGanttInfiniteTimeline } from '../../gantt-infinite-timeline';
import { IGanttTaskDraggingSettings } from './createGanttTaskDraggingModule';

const RESIZE_MODE = 'resize';

/** One dragged bar's cached pixel coordinates, as the chart holds them while a gesture runs. */
interface IGanttDragState {
    start_x?: number;
    pos?: { x: number, y: number };
    obj_s_x?: number;
    obj_e_x?: number;
}

/** The chart's task drag-and-drop state, which is not in its public API. */
interface IGanttTaskDnd {
    drag: IGanttDragState | null;
    dragMultiple?: { [taskId: string]: IGanttDragState };
}

export interface IGanttTaskDraggingParameters {
    /** Where the chart and the records it draws are reached. */
    services: IGanttServiceLocator;
    /** Which drag gestures this module was asked to allow. */
    settings: IGanttTaskDraggingSettings;
}

/**
 * What dragging a bar does to the task: the dates it writes, and the save that follows.
 *
 * The gesture itself belongs to the core's `GanttDragging` — whether the pointer is free, when a drag
 * starts and ends. This only answers what a drag means for the data, which is why it can be left out.
 */
export class GanttTaskDragging {
    private _services: IGanttServiceLocator;
    private _settings: IGanttTaskDraggingSettings;

    constructor(parameters: IGanttTaskDraggingParameters) {
        this._services = parameters.services;
        this._settings = parameters.settings;
        //the chart allows the gestures this module implements, and no others - the core leaves them all off
        this._gantt.config.drag_move = this._settings.enableMove;
        this._gantt.config.drag_resize = this._settings.enableResize;
        //dates come out of a drag exactly where the pointer left them, so a bar can start and end mid-day
        this._gantt.config.round_dnd_dates = false;
        this._registerEventListeners();
    }

    private get _taskGridServices(): ITaskGridServiceLocator {
        return this._services.get('taskGridServices');
    }

    private get _gantt(): GanttStatic {
        return this._services.get('ganttChart');
    }

    private get _dates(): IGanttDates {
        return this._services.get('ganttDates');
    }

    private get _timeline(): IGanttInfiniteTimeline {
        return this._services.get('ganttInfiniteTimeline');
    }

    private get _fieldMapping(): IGanttFieldMapping {
        return this._services.get('fieldMapping');
    }

    private get _taskDataProvider(): ITaskDataProvider {
        return this._taskGridServices.get('taskDataProvider');
    }

    private get _isTaskEditingEnabled(): boolean {
        return this._taskGridServices.get('gridParameters').enableTaskEditing ?? false;
    }

    private _registerEventListeners() {
        this._gantt.attachEvent('onBeforeTaskDrag', (id: string, mode: string) => this._onBeforeTaskDrag(id, mode));
        this._gantt.attachEvent('onTaskDrag', (id: string, mode: string) => this._onTaskDrag(id, mode));
        this._gantt.attachEvent('onAfterTaskDrag', (id: string) => this._onAfterTaskDrag(id));
        this._gantt.attachEvent('onGanttReady', this._onGanttReady);
        this._gantt.attachEvent('onDestroy', this._onDestroy);
    }

    //the pointer listeners go on once there is a root to put them on: the modules are built before the
    //chart is drawn into one
    private _onGanttReady = () => {
        //captured, because the chart measures the bar against the scale in its own mousedown handler and
        //the scale has to already fit the bar by then
        this._gantt.$root?.addEventListener('mousedown', this._onPointerDown, true);
        //on the document, so a press released off the chart is still an end - and after the chart's own
        //handler, which sits on the body and is what finishes the drag
        document.addEventListener('mouseup', this._onPointerUp);
        return true;
    };

    private _onDestroy = () => {
        document.removeEventListener('mouseup', this._onPointerUp);
        return true;
    };

    private _onPointerDown = (event: MouseEvent) => {
        if (!this._isTaskEditingEnabled) {
            return;
        }
        if (!(event.target as HTMLElement)?.closest?.(`.${GANTT_TASK_LINE_CLASS}`)) {
            return;
        }
        const taskId = this._gantt.locate(event);
        if (!this._gantt.isTaskExists(taskId)) {
            return;
        }
        const task = this._gantt.getTask(taskId);
        if (task?.start_date && task?.end_date) {
            this._timeline.fitRangeTo({ startDate: task.start_date, endDate: task.end_date });
        }
    };

    //every press ends here, including one that never became a drag - and the range a press fitted is one
    //the timeline would otherwise keep rendering
    private _onPointerUp = () => {
        this._timeline.restoreRange();
    };

    //the chart runs every handler attached to this event and lets any of them veto, so the core's own
    //reasons to refuse a drag are not repeated here. Read now rather than captured: the parameter can
    //change without the chart being rebuilt
    private _onBeforeTaskDrag(taskId: string, mode?: string): boolean {
        if (!this._isTaskEditingEnabled) {
            return false;
        }
        if (mode === RESIZE_MODE ? !this._settings.enableResize : !this._settings.enableMove) {
            return false;
        }
        return true;
    }

    private _onTaskDrag(taskId: string, mode: string) {
        const draggedTask = this._gantt.getTask(taskId);
        //so the bar can be dragged past either end of what is drawn, rather than stopping at it
        if (draggedTask?.end_date) {
            this._timeline.extendRangeEnd({ date: draggedTask.end_date });
        }
        if (draggedTask?.start_date) {
            this._shiftDragCoordinates(this._timeline.extendRangeStart({ date: draggedTask.start_date }));
        }
        const { startDate: startColumnName, endDate: endColumnName } = this._fieldMapping;

        if (mode === RESIZE_MODE) {
            const record = this._taskDataProvider.getRecordsMap()[taskId];
            record.setValue(startColumnName, draggedTask.start_date);
            record.setValue(endColumnName, draggedTask.end_date);
        }
        else {
            const draggedRecord = this._taskDataProvider.getRecordsMap()[taskId];
            const originalDraggedStartTime = this._dates.getStartDate(draggedRecord)?.getTime();
            const draggedTaskStartTime = draggedTask.start_date?.getTime();

            if (originalDraggedStartTime === undefined || draggedTaskStartTime === undefined) {
                return;
            }

            const draggedOffset = draggedTaskStartTime - originalDraggedStartTime;
            const originalEndDate = this._dates.getEndDate(draggedRecord);

            if (!originalEndDate) {
                return;
            }

            draggedTask.start_date = new Date(originalDraggedStartTime + draggedOffset);
            draggedTask.end_date = new Date(originalEndDate.getTime() + draggedOffset);

            draggedRecord.setValue(startColumnName, draggedTask.start_date);
            draggedRecord.setValue(endColumnName, draggedTask.end_date);
        }
    }

    /**
     * Moves a running drag's coordinates along with the range it is measured against.
     *
     * The chart works a drag out from pixel positions it caches when the gesture starts, and those are
     * measured from the start of the rendered range — so growing the range backwards moves the origin out
     * from under them, and the bar jumps by however far it moved. There is no public way to ask the chart
     * to re-base them, so they are shifted here: the only place that reaches into its drag state.
     *
     * @param offset How far every position on the chart moved, in pixels.
     */
    private _shiftDragCoordinates(offset: number) {
        const taskDnd = (this._gantt as unknown as { _tasks_dnd?: IGanttTaskDnd })._tasks_dnd;
        if (!taskDnd?.drag || !offset) {
            return;
        }
        const shift = (drag: IGanttDragState) => {
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
        };
        shift(taskDnd.drag);
        Object.values(taskDnd.dragMultiple ?? {}).forEach(shift);
    }

    private _onAfterTaskDrag(taskId: string) {
        this._taskDataProvider.save();
    }

}
