import type { ColDef } from "ag-grid-community";
import { DataTypes, IColumn, IEntityReference, IRawRecord, IRecord } from "@talxis/client-libraries";
import type { IGrid } from "@controls/grid";
import type { LabelsOf } from "@utils";
import type { ITaskDataProvider } from "../../provider";
import type { ITaskRuntime } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { TaskColumnValues } from "../column-values";
import { CHECKLIST_LABELS } from "./labels";
import { ChecklistCell } from "./components/adapters/checklist-cell";

export const CHECKLIST_COLUMN_NAME = 'checklist__virtual';

/** The entity name a checklist item's reference carries. */
export const CHECKLIST_ITEM_ETN = 'checklistitem';

/** One item of a task's checklist. */
export interface IChecklistItem {
    id: string;
    name: string;
    isCompleted: boolean;
}

/** Where checklist items are kept. */
export interface IChecklistStore {
    /** The items of these tasks, by task id; a task with none may be left out. */
    onLoadItems(taskIds: string[]): Promise<Map<string, IChecklistItem[]>>;
    /** Called as the checklist goes. */
    destroy?(): void;
}

export interface IChecklistParameters {
    onCreateStore: (taskRuntime: ITaskRuntime, checklist: IChecklist) => IChecklistStore;
}

/** What a checklist item's reference on the task's record carries. */
export interface IChecklistItemData {
    isCompleted: boolean;
}

/** The `checklist` module: each task's checklist items, loaded through its store onto the task's record. */
export interface IChecklist {
    /** What the last load threw, until the next one starts. */
    getError(): unknown;
    /** Loads the tasks' checklist items again, every loaded task's when none are given. */
    reload(taskIds?: string[]): Promise<void>;
    /** Called as the mount goes. */
    destroy(): void;
}

/** Each task's checklist progress, in a column Edit columns offers. */
export class Checklist implements IChecklist {
    private _store: IChecklistStore;
    private _labels: LabelsOf<typeof CHECKLIST_LABELS>;
    private _values: TaskColumnValues;
    private _unregisters: (() => void)[] = [];

    constructor(taskRuntime: ITaskRuntime, parameters: IChecklistParameters) {
        this._store = parameters.onCreateStore(taskRuntime, this);
        this._labels = taskRuntime.getLabels(CHECKLIST_LABELS);
        this._values = new TaskColumnValues({
            taskRuntime,
            columnNames: () => [CHECKLIST_COLUMN_NAME],
            onLoad: this._loadItems,
            errorMessage: () => this._labels.get('checklist.loadChecklistFailed'),
        });
        taskRuntime.services.whenAvailable('provider', this._onProviderAvailable);
        taskRuntime.services.get('datasetControl').parts.whenAvailable('grid', grid => this._onGridAvailable(grid as IGrid<ITaskGridServiceMap>));
    }

    public getError(): unknown {
        return this._values.getError();
    }

    public reload(taskIds?: string[]): Promise<void> {
        return this._values.reload(taskIds);
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
        this._values.destroy();
        this._store.destroy?.();
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): void => {
        this._unregisters.push(provider.registerAvailableColumns(this._addColumn));
    };

    //a task the store leaves out has no items left
    private _loadItems = async (taskIds: string[]): Promise<Map<string, IRawRecord>> => {
        const loaded = await this._store.onLoadItems(taskIds);
        return new Map(taskIds.map(taskId => [taskId, { [CHECKLIST_COLUMN_NAME]: (loaded.get(taskId) ?? []).map(this._toReference) }]));
    };

    private _toReference = (item: IChecklistItem): IEntityReference<IChecklistItemData> => ({
        id: { guid: item.id },
        name: item.name,
        etn: CHECKLIST_ITEM_ETN,
        data: { isCompleted: item.isCompleted },
    });

    private _addColumn = (columns: IColumn[]): void => {
        const column: IColumn = {
            name: CHECKLIST_COLUMN_NAME,
            displayName: this._labels.get('checklist.checklist'),
            dataType: DataTypes.LookupSimple,
            isVirtual: true,
            visualSizeFactor: 100,
            disableSorting: true,
            metadata: { IsValidForUpdate: false, SupportedFilterConditionOperators: [] },
        };
        if (!columns.some(existing => existing.name === CHECKLIST_COLUMN_NAME)) {
            columns.push(column);
        }
    };

    private _onGridAvailable(grid: IGrid<ITaskGridServiceMap>): void {
        this._unregisters.push(grid.services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree + 20));
    }

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const colDef = columnDefs.find(colDef => colDef.colId === CHECKLIST_COLUMN_NAME);
        if (colDef) {
            colDef.cellRenderer = ChecklistCell;
        }
    };
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** Each task's checklist progress. */
        checklist: IChecklist;
    }
}
