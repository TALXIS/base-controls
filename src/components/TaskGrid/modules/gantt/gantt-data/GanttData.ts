import { IRawRecord, IRecord } from "@talxis/client-libraries";
import { GanttStatic, Task } from "gantt-trial";
import { ITaskGridServiceLocator } from '@components/TaskGrid/services';
import { IGanttServiceLocator } from '../services';
import { IDeleteTasksResult, ITaskDataProvider } from '@components/TaskGrid/providers';
import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { toGanttTask } from './toGanttTask';

export interface IGanttData {
    events: IEventEmitter<IGanttDataEvents>;
    /** Parses every loaded task into the chart. The manager calls it once the chart exists. */
    load: () => void;
}

export interface IGanttDataParameters {
    /** Where the chart and the other parts are reached. */
    services: IGanttServiceLocator;
}

interface IGanttDataEvents {
    onDataParsed: (isFirstLoad: boolean) => void;
}

export class GanttData implements IGanttData {
    private _services: IGanttServiceLocator;
    private _isFirstLoad = true;
    public readonly events: IEventEmitter<IGanttDataEvents> = new EventEmitter<IGanttDataEvents>();

    constructor(parameters: IGanttDataParameters) {
        this._services = parameters.services;
        this._registerEventListeners();
    }

    private get _taskGridServices(): ITaskGridServiceLocator {
        return this._services.get('taskGridServices');
    }

    private get _gantt(): GanttStatic {
        return this._services.get('ganttChart');
    }

    private get _dataProvider(): ITaskDataProvider {
        return this._taskGridServices.get('taskDataProvider');
    }

    private _registerEventListeners() {
        this._dataProvider.addEventListener('onNewDataLoaded', () => this._loadTasksToGantt());
        this._dataProvider.addEventListener('onAfterRecordSaved', (result) => this._syncRecordsToGanttByIds([result.recordId]));
        this._dataProvider.taskEvents.addEventListener('onTaskDataUpdated', (data) => this._onTaskDataUpdated(data));
        this._dataProvider.taskEvents.addEventListener('onAfterTaskMoved', (movingTaskId) => this._onAfterTaskMoved(movingTaskId));
        this._dataProvider.taskEvents.addEventListener('onAfterTasksCreated', (records, parentId) => this._onAfterTasksCreated(records, parentId));
        this._dataProvider.taskEvents.addEventListener('onAfterTasksDeleted', (result) => this._onAfterTasksDeleted(result));
    }

    /**
     * The tasks the provider already holds, parsed into the chart.
     *
     * The grid loads its data before anything renders, so `onNewDataLoaded` has usually fired before this
     * class exists — the initial parse is driven by the manager instead of by that event.
     */
    public load() {
        this._loadTasksToGantt();
    }

    private _loadTasksToGantt() {
        //what is open is not carried over from the chart any more: every task is built with what the
        //expansion authority says, which is also what the grid draws, so a reload cannot leave the two
        //halves disagreeing
        const data = this._dataProvider.getRecords().map(record => toGanttTask(record, this._services));

        //one repaint for the whole load: `parse` repaints by itself, and so does everything it triggers
        this._gantt.batchUpdate(() => {
            this._gantt.clearAll();
            this._gantt.parse({
                data: data
            });
        });
        this.events.dispatchEvent('onDataParsed', this._isFirstLoad);
        this._isFirstLoad = false;
    }

    private _onAfterTasksCreated(rawRecords: IRawRecord[] | null, parentId?: string) {
        if (!rawRecords || rawRecords.length === 0) {
            return;
        }

        if (!this._insertCreatedTasksToGantt(rawRecords, parentId)) {
            this._loadTasksToGantt();
        }
    }

    private _insertCreatedTasksToGantt(rawRecords: IRawRecord[], parentId?: string): boolean {
        const primaryIdAttribute = this._dataProvider.getMetadata().PrimaryIdAttribute;
        const recordsMap = this._dataProvider.getRecordsMap();
        const recordTree = this._dataProvider.getRecordTree();
        const createdRecords = rawRecords
            .map(rawRecord => recordsMap[rawRecord[primaryIdAttribute]])
            .filter((record): record is IRecord => !!record);

        if (createdRecords.length !== rawRecords.length) {
            return false;
        }

        const treeOrder = new Map(recordTree.view.getOrderedIds().map((id, index) => [id, index] as const));
        createdRecords.sort((recordA, recordB) => {
            return (treeOrder.get(recordA.getRecordId()) ?? Number.MAX_SAFE_INTEGER)
                - (treeOrder.get(recordB.getRecordId()) ?? Number.MAX_SAFE_INTEGER);
        });

        let canInsertIncrementally = true;
        this._gantt.batchUpdate(() => {
            for (const record of createdRecords) {
                const task = toGanttTask(record, this._services);
                const parentTaskId = task.parent as string | undefined;

                if (this._gantt.isTaskExists(task.id)) {
                    canInsertIncrementally = false;
                    return;
                }
                if (parentTaskId && !this._gantt.isTaskExists(parentTaskId)) {
                    canInsertIncrementally = false;
                    return;
                }

                this._gantt.addTask(task, parentTaskId, recordTree.view.getPosition(record.getRecordId()));
            }

            if (!canInsertIncrementally) {
                return;
            }

            if (parentId && this._gantt.isTaskExists(parentId)) {
                this._syncRecordsToGanttByIds([parentId], false);
                //reported rather than opened here, so the row the new task went into is open on both
                //halves of the split view and stays open on the next load
                this._taskGridServices.get('taskExpansion').setExpanded(parentId, true);
            }
        });

        return canInsertIncrementally;
    }

    private _onAfterTaskMoved(movingFromTaskId: string) {
        if (!this._moveTaskInGantt(movingFromTaskId)) {
            this._loadTasksToGantt();
        }
    }

    private _moveTaskInGantt(movingFromTaskId: string): boolean {
        if (!this._gantt.isTaskExists(movingFromTaskId)) {
            return false;
        }

        const recordTree = this._dataProvider.getRecordTree();
        const oldParentId = this._getParentTaskId(this._gantt.getTask(movingFromTaskId).parent);
        const newParentId = recordTree.structure.getParent(movingFromTaskId)?.getRecordId();

        if (newParentId && !this._gantt.isTaskExists(newParentId)) {
            return false;
        }

        this._gantt.batchUpdate(() => {
            this._gantt.moveTask(movingFromTaskId, recordTree.view.getPosition(movingFromTaskId), newParentId);
            this._refreshHierarchyTask(oldParentId, false);
            this._refreshHierarchyTask(newParentId, false);
        });

        return true;
    }

    private _onAfterTasksDeleted(result: IDeleteTasksResult | null) {
        const deletedTaskIds = result?.deletedTaskIds ?? [];
        if (deletedTaskIds.length === 0) {
            return;
        }

        if (!this._deleteTasksFromGantt(deletedTaskIds)) {
            this._loadTasksToGantt();
        }
    }

    private _deleteTasksFromGantt(deletedTaskIds: string[]): boolean {
        const affectedParentIds = new Set<string>();

        this._gantt.batchUpdate(() => {
            for (const taskId of deletedTaskIds) {
                if (!this._gantt.isTaskExists(taskId)) {
                    continue;
                }

                const parentId = this._getParentTaskId(this._gantt.getTask(taskId).parent);
                if (parentId) {
                    affectedParentIds.add(parentId);
                }

                this._gantt.deleteTask(taskId);
            }

            for (const parentId of affectedParentIds) {
                this._refreshHierarchyTask(parentId, false);
            }
        });

        return true;
    }

    private _onTaskDataUpdated(data: IRawRecord[]) {
        this._syncRecordsToGantt(this._getRecordsFromRawData(data));
    }

    private _syncRecordToGantt(record: IRecord) {
        const id = record.getRecordId();
        if (!this._gantt.isTaskExists(id)) {
            return;
        }
        const taskToUpdate = this._gantt.getTask(id);
        const updatedTask = toGanttTask(record, this._services);
        for (const key in updatedTask) {
            if (key === 'parent') continue;
            taskToUpdate[key] = updatedTask[key];
        }
    }

    private _syncRecordsToGantt(records: IRecord[], useBatch: boolean = true) {
        const sync = () => {
            for (const record of records) {
                this._syncRecordToGantt(record);
            }
        };

        if (useBatch) {
            this._gantt.batchUpdate(sync);
            return;
        }

        sync();
    }

    private _syncRecordsToGanttByIds(recordIds: string[], useBatch: boolean = true) {
        const records = recordIds.map(recordId => this._dataProvider.getRecordsMap()[recordId])
        if (records.length === 0) {
            return;
        }
        this._syncRecordsToGantt(records, useBatch);
    }

    private _getRecordsFromRawData(data: IRawRecord[]) {
        const primaryIdAttribute = this._dataProvider.getMetadata().PrimaryIdAttribute;
        return data.map(rawRecord => this._dataProvider.getRecordsMap()[rawRecord[primaryIdAttribute]])
    }

    private _refreshHierarchyTask(taskId?: string, useBatch: boolean = true) {
        if (!taskId) {
            return;
        }

        this._syncRecordsToGanttByIds([taskId], useBatch);
    }

    private _getParentTaskId(parent: Task["parent"]): string | undefined {
        if (parent == null || parent === 0) {
            return undefined;
        }

        return String(parent);
    }
}
