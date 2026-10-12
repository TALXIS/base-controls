import { GridApi } from "ag-grid-community";
import { IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { IGridRuntime } from "@controls/grid";
import { ITaskGridServiceLocator } from "@controls/task-grid/services";
import { ITaskDataProvider } from "@controls/task-grid/providers/task";
import { ITaskTreeServiceMap } from "./GridTaskTree";
import { INACTIVE_ROW_CLASS, UNMATCHED_PARENT_ROW_CLASS } from "./constants";
import { repathSubtree } from "./repathSubtree";

export interface ITaskTreeUpdatesParameters {
    runtime: IGridRuntime<ITaskTreeServiceMap>;
}

/** Brings what the task operations changed into the grid. */
export class TaskTreeUpdates {
    private _runtime: IGridRuntime<ITaskTreeServiceMap>;
    private _savedRecords = new Set<IRecord>();

    constructor(parameters: ITaskTreeUpdatesParameters) {
        this._runtime = parameters.runtime;
        const rows = this._runtime.services.get('rows');
        rows.registerRowClass(INACTIVE_ROW_CLASS, ({ record }) => !record.isActive());
        rows.registerRowClass(UNMATCHED_PARENT_ROW_CLASS, ({ record }) => !this._taskDataProvider.getRecordTree().view.isMatching(record.getRecordId()));
        const taskEvents = this._taskDataProvider.taskEvents;
        taskEvents.addEventListener('onRecordTreeUpdated', this._onRecordTreeUpdated);
        taskEvents.addEventListener('onAfterTaskMoved', this._onAfterTaskMoved);
        taskEvents.addEventListener('onAfterTasksCreated', this._onAfterTasksCreated);
        taskEvents.addEventListener('onTaskDataUpdated', this._onTaskDataUpdated);
        this._taskDataProvider.addEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
        this._runtime.events.addEventListener('onDestroyed', this._onDestroyed);
    }

    private get _taskGrid(): ITaskGridServiceLocator {
        return this._runtime.services.get('taskGrid');
    }

    private get _taskDataProvider(): ITaskDataProvider {
        return this._taskGrid.get('taskDataProvider');
    }

    private get _gridApi(): GridApi<IRecord> | undefined {
        return this._runtime.services.find('gridApi');
    }

    //the provider outlives the grid
    private _onDestroyed = (): void => {
        const taskEvents = this._taskDataProvider.taskEvents;
        taskEvents.removeEventListener('onRecordTreeUpdated', this._onRecordTreeUpdated);
        taskEvents.removeEventListener('onAfterTaskMoved', this._onAfterTaskMoved);
        taskEvents.removeEventListener('onAfterTasksCreated', this._onAfterTasksCreated);
        taskEvents.removeEventListener('onTaskDataUpdated', this._onTaskDataUpdated);
        this._taskDataProvider.removeEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
    };

    private _onRecordTreeUpdated = (): void => {
        this._runtime.services.get('rowModel').refresh();
        this._refreshSubjectCells();
        this._taskDataProvider.requestRender();
    };

    //a null result is a move that did not happen
    private _onAfterTaskMoved = (movingTaskId: string, targetTaskId: string, position: 'above' | 'below' | 'child', result: IRawRecord[] | null): void => {
        if (!result) {
            return;
        }
        if (this._gridApi) {
            repathSubtree(this._gridApi, this._taskDataProvider, movingTaskId);
        }
        if (position === 'child') {
            this._taskGrid.get('taskExpansion').setExpanded(targetTaskId, true);
        }
        this._taskDataProvider.clearSelectedRecordIds();
    };

    private _onAfterTasksCreated = (records: IRawRecord[] | null, parentId?: string): void => {
        if (!records?.length) {
            return;
        }
        //the expansion is applied synchronously, so the new row is displayed by the time this goes on
        if (parentId) {
            this._taskGrid.get('taskExpansion').setExpanded(parentId, true);
        }
        const gridApi = this._gridApi;
        const recordId = records[0][this._taskDataProvider.getMetadata().PrimaryIdAttribute] as string;
        const node = gridApi?.getRowNode(recordId);
        if (!gridApi || !node || node.rowIndex === null) {
            return;
        }
        const subject = this._taskGrid.get('nativeColumns').subject;
        gridApi.ensureNodeVisible(node);
        if (records.length === 1 && this._taskGrid.get('taskGrid').isInlineCreateEnabled()) {
            gridApi.startEditingCell({ rowIndex: node.rowIndex, colKey: subject });
        }
        else {
            gridApi.setFocusedCell(node.rowIndex, subject);
        }
    };

    private _onTaskDataUpdated = (data: IRawRecord[]): void => {
        const gridApi = this._gridApi;
        if (!gridApi) {
            return;
        }
        const primaryIdAttribute = this._taskDataProvider.getMetadata().PrimaryIdAttribute;
        const recordIds = new Set(data.map(record => record[primaryIdAttribute]));
        gridApi.refreshCells({ rowNodes: gridApi.getRenderedNodes().filter(node => recordIds.has(node.id)), force: true });
    };

    //row classes read saved state, and a bulk save reports each record on its own
    private _onAfterRecordSaved = (result: IRecordSaveOperationResult): void => {
        const record = result.success && this._taskDataProvider.getRecordsMap()[result.recordId];
        if (!record) {
            return;
        }
        if (this._savedRecords.size === 0) {
            setTimeout(this._refreshSavedRows);
        }
        this._savedRecords.add(record);
    };

    private _refreshSavedRows = (): void => {
        const records = [...this._savedRecords];
        this._savedRecords.clear();
        this._runtime.services.get('rows').refreshRowClasses(records);
    };

    private _refreshSubjectCells(): void {
        this._gridApi?.refreshCells({ columns: [this._taskGrid.get('nativeColumns').subject], force: true });
    }
}
