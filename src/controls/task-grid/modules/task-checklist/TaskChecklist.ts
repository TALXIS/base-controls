import type { ColDef } from "ag-grid-community";
import type { IColumn, IEntityReference, IRawRecord, IRecord } from "@talxis/client-libraries";
import type { IGrid } from "@controls/grid";
import type { LabelsOf } from "@labels";
import type { ITaskDataProvider } from "../../runtime/provider";
import type { ITaskRuntime } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { createReadOnlyLookupColumn, TaskColumnValues } from "../../runtime/column-values";
import { TASK_CHECKLIST_LABELS } from "./labels";
import { TaskChecklistCell } from "./adapters/checklist-cell";
import type { ITaskChecklistUiProgressComponents } from "./ui/checklist-progress";

export const TASK_CHECKLIST_COLUMN_NAME = 'checklist__virtual';

/** The entity name a checklist item's reference carries. */
export const CHECKLIST_ITEM_ETN = 'checklistitem';

/** One item of a task's checklist. */
export interface ITaskChecklistItem {
    id: string;
    name: string;
    isCompleted: boolean;
}

/** Where checklist items are kept. */
export interface ITaskChecklistStore {
    /** The items of these tasks by task id. */
    loadItems(taskIds: string[]): Promise<Map<string, ITaskChecklistItem[]>>;
    /** Called as the checklist goes. */
    destroy?(): void;
}

/** The replaceable parts of what the checklist draws, by the piece they belong to. */
export interface ITaskChecklistComponents {
    /** The progress in a checklist cell. */
    progress?: Partial<ITaskChecklistUiProgressComponents>;
}

export interface ITaskChecklistParameters {
    createStore: (taskRuntime: ITaskRuntime) => ITaskChecklistStore;
    /** Loads a task's items again once its editor closes. */
    reloadOnEditorClosed?: boolean;
    components?: ITaskChecklistComponents;
}

/** What a checklist item's reference on the task's record carries. */
export interface ITaskChecklistItemData {
    isCompleted: boolean;
}

/** The `checklist` module, loading each task's items through its store. */
export interface ITaskChecklist {
    readonly components: ITaskChecklistComponents;
    /** What the last load threw, until the next one starts. */
    getError(): unknown;
    /** Loads the tasks' checklist items again, every loaded task's when none are given. */
    reload(taskIds?: string[]): Promise<void>;
    /** Called as the mount goes. */
    destroy(): void;
}

/** Each task's checklist progress, in a column Edit columns offers. */
export class TaskChecklist implements ITaskChecklist {
    public readonly components: ITaskChecklistComponents;
    private _store: ITaskChecklistStore;
    private _taskRuntime: ITaskRuntime;
    private _values: TaskColumnValues;

    constructor(taskRuntime: ITaskRuntime, parameters: ITaskChecklistParameters) {
        this.components = parameters.components ?? {};
        this._store = parameters.createStore(taskRuntime);
        this._taskRuntime = taskRuntime;
        this._values = new TaskColumnValues({
            taskRuntime,
            columnNames: () => [TASK_CHECKLIST_COLUMN_NAME],
            load: this._loadItems,
            errorMessage: () => this._labels.get('taskChecklist.loadChecklistFailed'),
            reloadOnEditorClosed: parameters.reloadOnEditorClosed,
        });
        taskRuntime.services.observe('provider', this._onProviderAvailable);
        taskRuntime.services.get('datasetControl').parts.observe('grid', this._onGridAvailable);
    }

    private get _labels(): LabelsOf<typeof TASK_CHECKLIST_LABELS> {
        return this._taskRuntime.getLabels(TASK_CHECKLIST_LABELS);
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
        return provider.addAvailableColumnsHook(this._addColumn);
    };

    //a task the store leaves out has no items left
    private _loadItems = async (taskIds: string[]): Promise<Map<string, IRawRecord>> => {
        const loaded = await this._store.loadItems(taskIds);
        return new Map(taskIds.map(taskId => [taskId, { [TASK_CHECKLIST_COLUMN_NAME]: (loaded.get(taskId) ?? []).map(this._toReference) }]));
    };

    private _toReference = (item: ITaskChecklistItem): IEntityReference<ITaskChecklistItemData> => ({
        id: { guid: item.id },
        name: item.name,
        etn: CHECKLIST_ITEM_ETN,
        data: { isCompleted: item.isCompleted },
    });

    private _addColumn = (columns: IColumn[]): void => {
        if (!columns.some(existing => existing.name === TASK_CHECKLIST_COLUMN_NAME)) {
            columns.push(createReadOnlyLookupColumn(TASK_CHECKLIST_COLUMN_NAME, this._labels.get('taskChecklist.checklist')));
        }
    };

    private _onGridAvailable = (grid: IGrid): void => {
        (grid as IGrid<ITaskGridServiceMap>).services.get('columns').addColumnDefinitionsHook(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree + 20);
    };

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const colDef = columnDefs.find(colDef => colDef.colId === TASK_CHECKLIST_COLUMN_NAME);
        if (colDef) {
            colDef.cellRenderer = TaskChecklistCell;
        }
    };
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** Each task's checklist progress. */
        taskChecklist: ITaskChecklist;
    }
}
