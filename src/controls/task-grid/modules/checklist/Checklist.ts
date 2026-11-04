import type { ColDef } from "ag-grid-community";
import type { IColumn, IEntityReference, IRawRecord, IRecord } from "@talxis/client-libraries";
import type { IGrid } from "@controls/grid";
import type { LabelsOf } from "@labels";
import type { ITaskDataProvider } from "../../runtime/provider";
import type { ITaskRuntime } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { createReadOnlyLookupColumn, TaskColumnValues } from "../column-values";
import { CHECKLIST_LABELS } from "./labels";
import { ChecklistCell } from "./adapters/checklist-cell";
import type { IChecklistProgressComponents } from "./ui/checklist-progress";

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
    /** The items of these tasks by task id. */
    onLoadItems(taskIds: string[]): Promise<Map<string, IChecklistItem[]>>;
    /** Called as the checklist goes. */
    destroy?(): void;
}

/** The replaceable parts of what the checklist draws, by the piece they belong to. */
export interface IChecklistComponents {
    /** The progress in a checklist cell. */
    progress?: Partial<IChecklistProgressComponents>;
}

export interface IChecklistParameters {
    onCreateStore: (taskRuntime: ITaskRuntime) => IChecklistStore;
    /** Loads a task's items again once its editor closes. */
    reloadOnEditorClosed?: boolean;
    components?: IChecklistComponents;
}

/** What a checklist item's reference on the task's record carries. */
export interface IChecklistItemData {
    isCompleted: boolean;
}

/** The `checklist` module, loading each task's items through its store. */
export interface IChecklist {
    readonly components: IChecklistComponents;
    /** What the last load threw, until the next one starts. */
    getError(): unknown;
    /** Loads the tasks' checklist items again, every loaded task's when none are given. */
    reload(taskIds?: string[]): Promise<void>;
    /** Called as the mount goes. */
    destroy(): void;
}

/** Each task's checklist progress, in a column Edit columns offers. */
export class Checklist implements IChecklist {
    public readonly components: IChecklistComponents;
    private _store: IChecklistStore;
    private _taskRuntime: ITaskRuntime;
    private _values: TaskColumnValues;

    constructor(taskRuntime: ITaskRuntime, parameters: IChecklistParameters) {
        this.components = parameters.components ?? {};
        this._store = parameters.onCreateStore(taskRuntime);
        this._taskRuntime = taskRuntime;
        this._values = new TaskColumnValues({
            taskRuntime,
            columnNames: () => [CHECKLIST_COLUMN_NAME],
            onLoad: this._loadItems,
            errorMessage: () => this._labels.get('checklist.loadChecklistFailed'),
            reloadOnEditorClosed: parameters.reloadOnEditorClosed,
        });
        taskRuntime.services.observe('provider', this._onProviderAvailable);
        taskRuntime.services.get('datasetControl').parts.observe('grid', this._onGridAvailable);
    }

    private get _labels(): LabelsOf<typeof CHECKLIST_LABELS> {
        return this._taskRuntime.getLabels(CHECKLIST_LABELS);
    }

    public getError(): unknown {
        return this._values.getError();
    }

    public reload(taskIds?: string[]): Promise<void> {
        return this._values.reload(taskIds);
    }

    public destroy(): void {
        this._store.destroy?.();
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): (() => void) => {
        return provider.registerAvailableColumns(this._addColumn);
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
        if (!columns.some(existing => existing.name === CHECKLIST_COLUMN_NAME)) {
            columns.push(createReadOnlyLookupColumn(CHECKLIST_COLUMN_NAME, this._labels.get('checklist.checklist')));
        }
    };

    private _onGridAvailable = (grid: IGrid): void => {
        (grid as IGrid<ITaskGridServiceMap>).services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree + 20);
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
