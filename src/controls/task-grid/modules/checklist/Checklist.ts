import type { ColDef } from "ag-grid-community";
import { DataTypes, EventEmitter, IColumn, IEventEmitter, IRecord } from "@talxis/client-libraries";
import type { IGrid } from "@controls/grid";
import { ILocalizationService, LocalizationService } from "@utils";
import type { ITaskDataProvider } from "../../provider";
import type { ITaskRuntime } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { CHECKLIST_LABELS, IChecklistLabels } from "./labels";
import { ChecklistCell } from "./components/adapters/checklist-cell";

export const CHECKLIST_COLUMN_NAME = 'checklist__virtual';

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
    /** The items of these tasks changed. */
    onItemsChanged: (taskIds: string[]) => void;
}

/** The `checklist` module: each task's checklist items, loaded through its store. */
export interface IChecklist {
    events: IEventEmitter<IChecklistEvents>;
    /** The task's items as loaded; none until its first load. */
    getItems(taskId: string): IChecklistItem[];
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
    private _itemsByTask = new Map<string, IChecklistItem[]>();
    private _unregisters: (() => void)[] = [];

    constructor(taskRuntime: ITaskRuntime, parameters: IChecklistParameters) {
        this._taskRuntime = taskRuntime;
        this._store = parameters.onCreateStore(taskRuntime);
        this._labels = new LocalizationService<IChecklistLabels>({ ...CHECKLIST_LABELS, ...parameters.labels });
        taskRuntime.services.whenAvailable('provider', this._onProviderAvailable);
        taskRuntime.registerGridModule({ onRegister: grid => this._onGridRegistered(grid) });
    }

    public getItems(taskId: string): IChecklistItem[] {
        return this._itemsByTask.get(taskId) ?? [];
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
        provider.taskEvents.addEventListener('onTasksDeleted', this._onTasksDeleted);
        provider.taskEvents.addEventListener('onTasksUpdated', this._onTasksUpdated);
        this._unregisters.push(
            provider.registerAvailableColumns(this._addColumn),
            () => provider.removeEventListener('onFirstDataLoaded', this._onFirstDataLoaded),
            () => provider.taskEvents.removeEventListener('onTasksDeleted', this._onTasksDeleted),
            () => provider.taskEvents.removeEventListener('onTasksUpdated', this._onTasksUpdated),
        );
    };

    private _onFirstDataLoaded = (): void => {
        this._load(Object.keys(this._taskRuntime.getProvider().getRecordsMap()));
    };

    private _onTasksDeleted = (taskIds: string[]): void => {
        taskIds.forEach(taskId => this._itemsByTask.delete(taskId));
        this.events.dispatchEvent('onItemsChanged', taskIds);
    };

    private _onTasksUpdated = (records: IRecord[]): void => {
        this._load(records.map(record => record.getRecordId()));
    };

    //a task the store leaves out has no items left
    private async _load(taskIds: string[]): Promise<void> {
        if (taskIds.length === 0) {
            return;
        }
        await this._taskRuntime.execute(async () => {
            const loaded = await this._store.onLoadItems(taskIds);
            taskIds.forEach(taskId => this._itemsByTask.set(taskId, loaded.get(taskId) ?? []));
            this.events.dispatchEvent('onItemsChanged', taskIds);
        }, { loading: { show: false }, error: { title: this._labels.getLocalizedString('loadChecklistFailed'), rethrow: false } });
    }

    private _addColumn = (columns: IColumn[]): void => {
        if (columns.some(column => column.name === CHECKLIST_COLUMN_NAME)) {
            return;
        }
        columns.push({
            name: CHECKLIST_COLUMN_NAME,
            displayName: this._labels.getLocalizedString('checklist'),
            dataType: DataTypes.SingleLineText,
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
