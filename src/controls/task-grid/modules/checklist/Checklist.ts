import type { ColDef } from "ag-grid-community";
import { DataTypes, EventEmitter, IColumn, IEntityReference, IEventEmitter, IRecord } from "@talxis/client-libraries";
import type { GridCellLoadingHook, IGrid } from "@controls/grid";
import { ILocalizationService, LocalizationService } from "@utils";
import type { ITaskDataProvider, TaskLoadWaiter } from "../../provider";
import type { ITaskRuntime } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
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

export interface IChecklistEvents {
    onLoading: (isLoading: boolean) => void;
}

/** What a checklist item's reference on the task's record carries. */
export interface IChecklistItemData {
    isCompleted: boolean;
}

/** The `checklist` module: each task's checklist items, loaded through its store onto the task's record. */
export interface IChecklist {
    events: IEventEmitter<IChecklistEvents>;
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
    public events = new EventEmitter<IChecklistEvents>();
    private _taskRuntime: ITaskRuntime;
    private _store: IChecklistStore;
    private _labels: ILocalizationService<IChecklistLabels>;
    private _isLoading = false;
    private _hasStartedLoading = false;
    private _currentLoad?: Promise<void>;
    private _error?: unknown;
    private _unregisters: (() => void)[] = [];

    constructor(taskRuntime: ITaskRuntime, parameters: IChecklistParameters) {
        this._taskRuntime = taskRuntime;
        this._store = parameters.onCreateStore(taskRuntime);
        this._labels = new LocalizationService<IChecklistLabels>({ ...CHECKLIST_LABELS, ...parameters.labels });
        taskRuntime.services.whenAvailable('provider', this._onProviderAvailable);
        taskRuntime.registerGridModule({ onRegister: grid => this._onGridRegistered(grid) });
    }

    public getError(): unknown {
        return this._error;
    }

    public reload(taskIds?: string[]): Promise<void> {
        return this._load(taskIds ?? Object.keys(this._taskRuntime.getProvider().getRecordsMap()));
    }

    public getLabels(): ILocalizationService<IChecklistLabels> {
        return this._labels;
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
        this.events.clearEventListeners();
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): void => {
        provider.addEventListener('onFirstDataLoaded', this._onFirstDataLoaded);
        this._unregisters.push(
            provider.registerAvailableColumns(this._addColumn),
            provider.registerLoadWaiter(this._waitForItems),
            () => provider.removeEventListener('onFirstDataLoaded', this._onFirstDataLoaded),
        );
    };

    private _onFirstDataLoaded = (): void => {
        if (!this._hasStartedLoading) {
            this._load(Object.keys(this._taskRuntime.getProvider().getRecordsMap()));
        }
    };

    //a sort, filter or search on the column has to see the items
    private _waitForItems: TaskLoadWaiter = async params => {
        if (this._taskRuntime.getProvider().isColumnQueried(CHECKLIST_COLUMN_NAME)) {
            await (this._hasStartedLoading ? this._currentLoad : this._load(params.taskIds));
        }
    };

    private _load(taskIds: string[]): Promise<void> {
        this._hasStartedLoading = true;
        this._currentLoad = this._loadItems(taskIds);
        return this._currentLoad;
    }

    //a task the store leaves out has no items left
    private async _loadItems(taskIds: string[]): Promise<void> {
        if (taskIds.length === 0) {
            return;
        }
        this._error = undefined;
        this._setLoading(true);
        try {
            const loaded = await this._store.onLoadItems(taskIds);
            const provider = this._taskRuntime.getProvider();
            const primaryIdAttribute = provider.getMetadata().PrimaryIdAttribute!;
            provider.updateTaskData(taskIds.map(taskId => ({ [primaryIdAttribute]: taskId, [CHECKLIST_COLUMN_NAME]: (loaded.get(taskId) ?? []).map(this._toReference) })));
        }
        catch (error) {
            this._error = new Error(this._labels.getLocalizedString('loadChecklistFailed'), { cause: error });
        }
        finally {
            this._setLoading(false);
        }
    }

    private _toReference = (item: IChecklistItem): IEntityReference<IChecklistItemData> => ({
        id: { guid: item.id },
        name: item.name,
        etn: CHECKLIST_ITEM_ETN,
        data: { isCompleted: item.isCompleted },
    });

    private _setLoading(isLoading: boolean): void {
        this._isLoading = isLoading;
        this.events.dispatchEvent('onLoading', isLoading);
    }

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
        grid.services.get('cells').registerCellLoading(this._onCellLoading, TASK_GRID_PRIORITY.tree + 20);
    }

    private _onCellLoading: GridCellLoadingHook = (result, params) => {
        if (this._isLoading && params.columnName === CHECKLIST_COLUMN_NAME) {
            result.isLoading = true;
        }
    };

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
