import type { GanttStatic } from "gantt-trial";
import type { ITaskDataProvider } from "../../../provider";
import type { ITaskRuntime } from "../../../runtime";
import { runQuietly } from "../../../runtime/runQuietly";
import type { IGanttTasks } from "../tasks/GanttTasks";
import { GANTT_ROW_SELECTED_CLASS } from "../chart/classNames";

/** Selecting tasks from the chart, through the provider's selection. */
export interface IGanttSelection {
    isSelected(taskId: string): boolean;
    /** Selects exactly these tasks, or adds them to the selection. */
    select(taskIds: string[], options?: { isAdditive?: boolean }): void;
}

export interface IGanttSelectionParameters {
    gantt: GanttStatic;
    taskRuntime: ITaskRuntime;
    tasks: IGanttTasks;
    onSelectionChanged: () => void;
}

export class GanttSelection implements IGanttSelection {
    private _gantt: GanttStatic;
    private _taskRuntime: ITaskRuntime;
    private _provider: ITaskDataProvider;
    private _tasks: IGanttTasks;
    private _onSelectionChanged: () => void;
    private _rangeAnchorTaskId?: string;
    private _eventIds: string[];
    private _unregisterRowClass: () => void;

    constructor(parameters: IGanttSelectionParameters) {
        this._gantt = parameters.gantt;
        this._taskRuntime = parameters.taskRuntime;
        this._provider = parameters.taskRuntime.getProvider();
        this._tasks = parameters.tasks;
        this._onSelectionChanged = parameters.onSelectionChanged;
        this._eventIds = [
            this._gantt.attachEvent('onTaskClick', this._onTaskClick),
            this._gantt.attachEvent('onTaskDblClick', this._onTaskDblClick),
        ];
        this._provider.addEventListener('onRecordsSelected', this._onSelectionChanged);
        this._unregisterRowClass = this._tasks.registerRowClass((classNames, { record }) => {
            if (this.isSelected(record.getRecordId())) {
                classNames.push(GANTT_ROW_SELECTED_CLASS);
            }
        });
    }

    public isSelected(taskId: string): boolean {
        return this._provider.getSelectedRecordIds().includes(taskId);
    }

    public select(taskIds: string[], options?: { isAdditive?: boolean }): void {
        this._provider.setSelectedRecordIds(options?.isAdditive ? [...new Set([...this._provider.getSelectedRecordIds(), ...taskIds])] : taskIds);
    }

    public destroy(): void {
        this._eventIds.forEach(eventId => this._gantt.detachEvent(eventId));
        this._provider.removeEventListener('onRecordsSelected', this._onSelectionChanged);
        this._unregisterRowClass();
    }

    private _onTaskClick = (id: string | number, event?: MouseEvent): boolean => {
        const taskId = String(id);
        const isToggle = !!event?.ctrlKey || !!event?.metaKey;
        if (event?.shiftKey) {
            this._selectRange(taskId, isToggle);
            return true;
        }
        this._rangeAnchorTaskId = taskId;
        if (isToggle) {
            this._provider.toggleSelectedRecordId(taskId);
        }
        else {
            this.select([taskId]);
        }
        return true;
    };

    private _onTaskDblClick = (id: string | number): boolean => {
        const record = this._tasks.getRecord(String(id));
        if (record) {
            runQuietly(() => this._taskRuntime.tasks.open(record.getNamedReference()));
        }
        return false;
    };

    private _selectRange(taskId: string, isAdditive: boolean): void {
        const taskIds = this._tasks.getTaskIds();
        const from = taskIds.indexOf(this._rangeAnchorTaskId ?? taskId);
        const to = taskIds.indexOf(taskId);
        if (from >= 0 && to >= 0) {
            this.select(taskIds.slice(Math.min(from, to), Math.max(from, to) + 1), { isAdditive });
        }
    }
}
