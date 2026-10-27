import type { ColDef } from "ag-grid-community";
import { DataTypes, IColumn, IEntityReference, IRawRecord, IRecord } from "@talxis/client-libraries";
import type { IGrid } from "@controls/grid";
import { ILocalizationService, LocalizationService } from "@utils";
import type { ITaskDataProvider } from "../../provider";
import type { ITaskRuntime } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { TaskColumnValues } from "../column-values";
import { CHECKLIST_LABELS, IChecklistLabels } from "./labels";
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
}

export interface IChecklistParameters {
    onCreateStore: (taskRuntime: ITaskRuntime) => IChecklistStore;
    /** Overrides for the module's strings. */
    labels?: Partial<IChecklistLabels>;
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
    getLabels(): ILocalizationService<IChecklistLabels>;
    /** Called as the mount goes. */
    destroy(): void;
}

/** Each task's checklist progress, in a column Edit columns offers. */
export class Checklist implements IChecklist {
    private _store: IChecklistStore;
    private _labels: ILocalizationService<IChecklistLabels>;
    private _values: TaskColumnValues;
    private _unregisters: (() => void)[] = [];

    constructor(taskRuntime: ITaskRuntime, parameters: IChecklistParameters) {
        this._store = parameters.onCreateStore(taskRuntime);
        this._labels = new LocalizationService<IChecklistLabels>({ ...CHECKLIST_LABELS, ...parameters.labels });
        this._values = new TaskColumnValues({
            taskRuntime,
            columnNames: () => [CHECKLIST_COLUMN_NAME],
            onLoad: this._loadItems,
            errorMessage: () => this._labels.getLocalizedString('loadChecklistFailed'),
        });
        taskRuntime.services.whenAvailable('provider', this._onProviderAvailable);
        taskRuntime.registerGridModule({ onRegister: grid => this._onGridRegistered(grid) });
    }

    public getError(): unknown {
        return this._values.getError();
    }

    public reload(taskIds?: string[]): Promise<void> {
        return this._values.reload(taskIds);
    }

    public getLabels(): ILocalizationService<IChecklistLabels> {
        return this._labels;
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
        this._values.destroy();
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
        if (columns.some(column => column.name === CHECKLIST_COLUMN_NAME)) {
            return;
        }
        columns.push({
            name: CHECKLIST_COLUMN_NAME,
            displayName: this._labels.getLocalizedString('checklist'),
            dataType: DataTypes.LookupSimple,
            isVirtual: true,
            visualSizeFactor: 100,
            disableSorting: true,
            metadata: { IsValidForUpdate: false, SupportedFilterConditionOperators: [] },
        });
    };

    private _onGridRegistered(grid: IGrid<ITaskGridServiceMap>): void {
        grid.services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree + 20);
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
