import type { IAvailableRelatedColumn, IColumn, IDataProvider, ILinkEntityExposedExpression, IMemoryProviderEntityMetadata, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { IDatasetControlResolvedView } from "@controls/dataset-control";
import type { IEventSubscriber } from "@utils";
import type { IRecordTree } from "./record-tree";

/** Which columns of a task record hold what the task grid works with. */
export interface IFieldMapping {
    /** The lookup to the parent task, which makes the tree. */
    parentId: string;
    /** The task's name, drawn with the chevron. */
    subject: string;
    /** The order among siblings, compared as text. */
    stackRank: string;
    /** Whether the task is active: `0` is active. */
    stateCode: string;
    startDate?: string;
    endDate?: string;
    percentComplete?: string;
}

/** What a task view starts the provider with. */
export interface ITaskViewData {
    columns: IColumn[];
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null;
    linking?: ILinkEntityExposedExpression[];
    /** The columns quick find searches, by name. */
    quickFindColumns?: string[];
    searchQuery?: string;
    /** Lists the matching tasks on their own, without the tree, until the user changes it. */
    isFlatList?: boolean;
}

/** A view of the tasks, user views included. */
export type ITaskView = IDatasetControlResolvedView<ITaskViewData>;

/** One record an operation could not complete, and why. */
export interface IFailedRecord {
    id: string;
    error: any;
}

/** Which tasks a delete removed, and which it could not. */
export type IDeleteTasksResult =
    | { success: true; deletedTaskIds: string[] }
    | { success: false; deletedTaskIds: string[]; errors: IFailedRecord[] };

/** The records opening came back with changed, and which could not be opened. */
export type IOpenTasksResult =
    | { success: true; updatedRecords: IRawRecord[] }
    | { success: false; updatedRecords: IRawRecord[]; errors: IFailedRecord[] };

/** Where a task lands, resolved over every loaded task whatever the view hides. */
export interface ITaskSiblingContext {
    /** The parent it lands under; none for the top level. */
    parentRecord?: IRecord;
    /** Every record under that parent, in order, without the task itself. */
    siblings: IRecord[];
    previousSibling?: IRecord;
    nextSibling?: IRecord;
    fieldMapping: IFieldMapping;
}

/** Where a new task lands, and what it starts with. */
export interface ITaskCreateParams extends ITaskSiblingContext {
    /** Values the caller asked for, by column name; applied over the strategy's defaults. */
    data?: { [columnName: string]: any };
    /** The columns the provider shows. */
    columns: IColumn[];
    metadata: IMemoryProviderEntityMetadata;
}

/** Where a task was dropped. */
export type ITaskMovePosition = 'above' | 'below' | 'child';

/** A move the provider resolved; a move into the task's own subtree never gets this far. */
export interface ITaskMoveParams extends ITaskSiblingContext {
    movingRecord: IRecord;
    targetRecord: IRecord;
    position: ITaskMovePosition;
}

/** What deleting tasks would remove, and what the strategy keeps. */
export interface ITaskDeletion {
    /** The tasks and their subtrees, less refused tasks and the ancestors of those. */
    deletableTaskIds: string[];
    /** The tasks the strategy refused. */
    refusedTaskIds: string[];
}

/** Tasks with no subtasks left to delete, with the whole tree they are in. */
export interface ITaskDeleteParams {
    taskIds: string[];
    tree: IRecordTree;
}

/** Where a created task lands among its siblings, and what it starts with. */
export interface ICreateTaskOptions {
    previousTaskId?: string;
    /** Defaults to the parent's first child. */
    nextTaskId?: string;
    data?: { [columnName: string]: any };
}

/** What the tasks were loaded with. */
export interface ITaskLoadResult {
    rawData: IRawRecord[];
    metadata: IMemoryProviderEntityMetadata;
    columns: IColumn[];
}

/** Where the tasks come from and how changing them is persisted. */
export interface ITaskStrategy {
    /** Loads every task of the view the provider was created for. */
    onLoad(provider: ITaskDataProvider): Promise<ITaskLoadResult>;
    /** The columns Edit columns offers. */
    onGetAvailableColumns(): Promise<IColumn[]>;
    onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]>;
    /** @returns The created record, or `null` when the user cancelled. */
    onCreateTask(params: ITaskCreateParams): Promise<IRawRecord | null>;
    /** Whether a task may be deleted; every task may when left out. */
    onCanDeleteTask?(task: IRecord): boolean;
    /**
     * Called level by level, deepest first, so no task it gets has subtasks left.
     * @returns Which tasks went, or `null` when the user cancelled.
     */
    onDeleteTasks(params: ITaskDeleteParams): Promise<IDeleteTasksResult | null>;
    /** @returns The records the move changed, or `null` when the user cancelled. */
    onMoveTask(params: ITaskMoveParams): Promise<IRawRecord[] | null>;
    onSaveRecord(record: IRecord): Promise<IRecordSaveOperationResult>;
    /** Opens tasks, or a record a task's lookup points to when `isTask` is `false`. */
    onOpenRecords(references: ComponentFramework.EntityReference[], isTask: boolean): Promise<IOpenTasksResult | null>;
}

/** What the task provider raises once an operation is done. */
export interface ITaskDataProviderEvents {
    onTasksCreated: (records: IRecord[], parentId?: string) => void;
    onTasksDeleted: (taskIds: string[]) => void;
    onTaskMoved: (params: ITaskMoveParams) => void;
    /** Records changed in place, such as after a form closed. */
    onTasksUpdated: (records: IRecord[]) => void;
    /** The visible tree changed without new data: a move, a create or a delete. */
    onTreeChanged: () => void;
}

/** A provider of tasks: every task loaded at once and shown as a tree. */
/** What the task runtime hands a task provider before it loads. */
export interface ITaskDataProviderInitializeParameters {
    fieldMapping: IFieldMapping;
    /** Scopes the tree to the subtree under this task. */
    rootTaskId?: string;
}

/** Changes the columns Edit columns offers, in place. */
export type TaskAvailableColumnsHook = (columns: IColumn[]) => void;

export interface ITaskDataProvider extends IDataProvider {
    readonly taskEvents: IEventSubscriber<ITaskDataProviderEvents>;
    /** Takes the control's field mapping and root task before the provider loads. */
    initialize(parameters: ITaskDataProviderInitializeParameters): void;
    /** @throws Before `initialize`. */
    getFieldMapping(): IFieldMapping;
    getStrategy(): ITaskStrategy;
    /** Every loaded task, whatever the view shows. */
    getAllRecords(): IRecord[];
    getRecordTree(): IRecordTree;
    /** The task the tree is scoped to, if any. */
    getRootTaskId(): string | undefined;
    /** The columns quick find searches, by name; the subject when none are set. */
    setQuickFindColumns(columnNames: string[]): void;
    areInactiveTasksHidden(): boolean;
    setInactiveTasksHidden(isHidden: boolean): void;
    isRecordActive(recordId: string): boolean;
    /** Creates a task under `parentId`, first among its siblings unless `options` say otherwise. */
    createTask(parentId?: string, options?: ICreateTaskOptions): Promise<IRecord | null>;
    /** Adds tasks that already exist, such as ones a template created. */
    addTasks(rawRecords: IRawRecord[], parentId?: string): IRecord[];
    /** Whether the task was created in this load; it shows whatever the filter. */
    isNewTask(taskId: string): boolean;
    getDeletion(taskIds: string[]): ITaskDeletion;
    /** Deletes the tasks and their subtrees bottom-up, keeping the ancestors of a refused or failed task. */
    deleteTasks(taskIds: string[]): Promise<IDeleteTasksResult | null>;
    /** @returns Whether the task moved. */
    moveTask(movingTaskId: string, targetTaskId: string, position: ITaskMovePosition): Promise<boolean>;
    openTasks(taskIds: string[]): Promise<IOpenTasksResult | null>;
    /** Writes changed raw data onto the records it belongs to. */
    updateTaskData(rawRecords: IRawRecord[]): void;
    /** Changes the available columns, also read as definitions for saved views that list them. */
    registerAvailableColumns(hook: TaskAvailableColumnsHook, priority?: number): () => void;
}
