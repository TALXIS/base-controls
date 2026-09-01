import { EventEmitter, IEventEmitter } from '@talxis/client-libraries';
import { GanttStatic } from 'gantt-trial';
import { ITaskGridServiceLocator } from '@components/TaskGrid/services';
import { IGanttServiceLocator } from '../services';
import { ITaskDataProvider } from '@components/TaskGrid/providers';
import { IGanttDates } from '../gantt-dates';
import {
    GANTT_DRAGGING_DISABLED_CLASS,
    GANTT_TASK_LINE_CLASS,
} from '../classNames';

export interface IGanttDragging {
    events: IEventEmitter<IGanttDraggingEvents>;
    setDraggingDisabled: (disabled: boolean) => void;
}

export interface IGanttDraggingEvents {
    onDragStarted: (taskId: string) => void;
    onDragEnded: () => void;
}

/** Constructor parameters for {@link GanttDragging}. */
export interface IGanttDraggingParameters {
    /** Where the chart and the other parts are reached. */
    services: IGanttServiceLocator;
}

export class GanttDragging implements IGanttDragging {
    public readonly events: IEventEmitter<IGanttDraggingEvents> = new EventEmitter<IGanttDraggingEvents>();
    private _services: IGanttServiceLocator;

    constructor(parameters: IGanttDraggingParameters) {
        this._services = parameters.services;
        this._gantt.config.drag_timeline = { ignore: `.${GANTT_DRAGGING_DISABLED_CLASS}, .${GANTT_TASK_LINE_CLASS}` };
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

    private get _taskDataProvider(): ITaskDataProvider {
        return this._taskGridServices.get('taskDataProvider');
    }

    public setDraggingDisabled(disabled: boolean) {
        this._gantt.$root.classList.toggle(GANTT_DRAGGING_DISABLED_CLASS, disabled);
    }

    private _registerEventListeners() {
        this._gantt.attachEvent('onBeforeTaskDrag', (id: string, mode: string) => this._onBeforeTaskDrag(id, mode));
        this._gantt.attachEvent('onTaskDrag', (id: string, mode: string) => this._onTaskDrag(id, mode));
        this._gantt.attachEvent('onAfterTaskDrag', () => this._onAfterTaskDrag());
    }

    private _onBeforeTaskDrag(taskId: string, mode?: string) {
        if (this._gantt.$root.classList.contains(GANTT_DRAGGING_DISABLED_CLASS)) {
            return false;
        }
        const task = this._gantt.getTask(taskId);
        if (!task?.active) return false;
        this.events.dispatchEvent('onDragStarted', taskId);
        return true;
    }

    private _onTaskDrag(taskId: string, mode: string) {
        const draggedTask = this._gantt.getTask(taskId);
        const startColumnName = this._dates.getStartDateColumnName();
        const endColumnName = this._dates.getEndDateColumnName();

        if (mode === 'resize') {
            const record = this._taskDataProvider.getRecordsMap()[taskId];
            record.setValue(startColumnName, draggedTask.start_date);
            record.setValue(endColumnName, draggedTask.end_date);
        }
        else {
            const draggedRecord = this._taskDataProvider.getRecordsMap()[taskId];
            const originalDraggedStartDate = draggedRecord.getValue(startColumnName);
            const originalDraggedStartTime = this._dates.getDateFromString(originalDraggedStartDate)?.getTime();
            const draggedTaskStartTime = draggedTask.start_date?.getTime();

            if (originalDraggedStartTime === undefined || draggedTaskStartTime === undefined) {
                return;
            }

            const draggedOffset = draggedTaskStartTime - originalDraggedStartTime;
            const originalEndDate = this._dates.getDateFromString(draggedRecord.getValue(endColumnName));

            if (!originalEndDate) {
                return;
            }

            draggedTask.start_date = new Date(originalDraggedStartTime + draggedOffset);
            draggedTask.end_date = new Date(originalEndDate.getTime() + draggedOffset);

            draggedRecord.setValue(startColumnName, draggedTask.start_date);
            draggedRecord.setValue(endColumnName, draggedTask.end_date);
        }
    }

    private _onAfterTaskDrag() {
        this.events.dispatchEvent('onDragEnded');
        this._taskDataProvider.save();
    }
}