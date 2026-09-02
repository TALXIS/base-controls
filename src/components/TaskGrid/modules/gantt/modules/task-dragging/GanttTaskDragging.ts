import { GanttStatic } from 'gantt-trial';
import { ITaskDataProvider } from '@components/TaskGrid/providers';
import { ITaskGridServiceLocator } from '@components/TaskGrid/services';
import { IGanttFieldMapping, IGanttServiceLocator } from '../../services';
import { IGanttDates } from '../../gantt-dates';
import { IGanttTaskDraggingSettings } from './createGanttTaskDraggingModule';

const RESIZE_MODE = 'resize';

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
        this._gantt.attachEvent('onBeforeTaskDrag', (id: string, mode: string) => this._onBeforeTaskDrag(mode));
        this._gantt.attachEvent('onTaskDrag', (id: string, mode: string) => this._onTaskDrag(id, mode));
        this._gantt.attachEvent('onAfterTaskDrag', () => this._onAfterTaskDrag());
    }

    //the chart runs every handler attached to this event and lets any of them veto, so the core's own
    //reasons to refuse a drag are not repeated here. Read now rather than captured: the parameter can
    //change without the chart being rebuilt
    private _onBeforeTaskDrag(mode?: string): boolean {
        if (!this._isTaskEditingEnabled) {
            return false;
        }
        return mode === RESIZE_MODE ? this._settings.enableResize : this._settings.enableMove;
    }

    private _onTaskDrag(taskId: string, mode: string) {
        const draggedTask = this._gantt.getTask(taskId);
        const { startDate: startColumnName, endDate: endColumnName } = this._fieldMapping;

        if (mode === RESIZE_MODE) {
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
        this._taskDataProvider.save();
    }
}
