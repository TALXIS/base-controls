import type { IAvailableColumnOptions, IAvailableRelatedColumn, IColumn, IDataProvider, IFormatting, IMemoryProviderEntityMetadata, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { IDatasetControlResolvedView } from "@controls/dataset-control";
import type { IUserQuerySavedValueMap } from "@controls/dataset-control/modules/user-queries/interfaces";
import type { IEventSubscriber, IHookPoint } from "@core";
import type { IRecordTree } from "./record-tree";

/** Which columns of a task record hold what the task grid works with. */
export interface IFieldMapping {
    /** The lookup to the parent task. */
    parentId: string;
    /** The task's name, drawn with the chevron. */
    subject: string;
    /** The order among siblings, compared as text. */
    stackRank: string;
    /** Whether the task is active: `0` is, any other value or none is not. */
    stateCode: string;
    startDate?: string;
    endDate?: string;
    /** The task's duration in minutes, as a duration column holds it. */
    duration?: string;
    percentComplete?: string;
}

declare module "@controls/dataset-control/modules/user-queries/interfaces" {
    interface IUserQuerySavedValueMap {
        sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
        filtering: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null;
        /** The columns quick find searches, by name. */
        quickFindColumns: string[];
        searchQuery: string;
        /** Lists the matching tasks on their own, without the tree, until the user changes it. */
        isFlatList: boolean;
    }
}

/** The values a task view starts the provider with, as a user view saves them. */
export interface ITaskViewData extends Partial<IUserQuerySavedValueMap> { }

/** A view of the tasks, user views included. */
export type ITaskView = IDatasetControlResolvedView<ITaskViewData>;

/** One record an operation could not complete, and why. */
export interface IFailedRecord {
    id: string;
    error: any;
}

/** The tasks the backend changed since the store last read them. */
export interface ITaskChanges {
    /** Raw data by the primary id, merged into the loaded tasks. */
    updatedRecords: IRawRecord[];
}

/** The task a create made. */
export interface ITaskCreateResult {
    record: IRawRecord;
}

/** The tasks a backend created at once. */
export interface ITasksCreateResult {
    /** Every task created, subtasks included. */
    records: IRawRecord[];
}

/** Which tasks a delete removed, and which it could not. */
export type IDeleteTasksResult =
    | { success: true; deletedTaskIds: string[] }
    | { success: false; deletedTaskIds: string[]; errors: IFailedRecord[] };

/** How opening the tasks went, and which could not be opened. */
export type IOpenTasksResult =
    | { success: true }
    | { success: false; errors: IFailedRecord[] };

/** Where among its parent's children a new task goes. */
export type TaskCreatePosition = 'first' | 'last';

/** Where a new task lands, and what it starts with. */
export interface ITaskCreateParameters {
    /** None for the top level. */
    parentRecord?: IRecord;
    /** Resolved by the provider for the store to save as is. */
    stackRank: string;
    /** Column values the task starts with. */
    data?: { [columnName: string]: any };
    /** The id of a single task the grid already shows. */
    taskId?: string;
}

/** Where a task was dropped. */
export type ITaskMovePosition = 'above' | 'below' | 'child';

/** A move the provider resolved. */
export interface ITaskMoveParameters {
    movingRecord: IRecord;
    targetRecord: IRecord;
    position: ITaskMovePosition;
    /** None for the top level. */
    parentRecord?: IRecord;
    /** Resolved by the provider for the store to save as is. */
    stackRank: string;
}

/** What deleting tasks would remove, and what the store keeps. */
export interface ITaskDeletion {
    /** The tasks and their subtrees, less refused tasks and the ancestors of those. */
    deletableTaskIds: string[];
    /** The tasks the store refused. */
    refusedTaskIds: string[];
}

/** Tasks with no subtasks left to delete, with the whole tree they are in. */
export interface ITaskDeleteParameters {
    taskIds: string[];
    tree: IRecordTree;
}

/** Where a created task lands among its siblings, and what it starts with. */
export interface INewTaskParameters {
    /** The provider's default when left out. */
    position?: TaskCreatePosition;
    data?: { [columnName: string]: any };
}

/** A task to create, with the tasks to create under it. */
export interface ICreateTaskTree {
    data?: { [columnName: string]: any };
    children?: ICreateTaskTree[];
}

/** What the tasks were loaded with. */
export interface ITaskLoadResult {
    rawData: IRawRecord[];
    metadata: IMemoryProviderEntityMetadata;
    /** Read only for columns the available columns do not offer. */
    columns: IColumn[];
}

/** Where the tasks come from and how changing them is persisted. */
export interface ITaskStore {
    /** Loads every task of the view the provider was created for. */
    load(provider: ITaskDataProvider): Promise<ITaskLoadResult>;
    /** The columns Edit columns offers, of `options.entityName` when given. */
    getAvailableColumns(options?: IAvailableColumnOptions): Promise<IColumn[]>;
    getAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]>;
    /** Creates the task the grid already shows under `params.taskId`, or `null` to drop it. */
    createTask(parameters: ITaskCreateParameters): Promise<ITaskCreateResult | null>;
    /** Whether a task may be deleted. */
    canDeleteTask?(task: IRecord): boolean;
    /**
     * Called level by level, deepest first.
     * @returns Which tasks went, or `null` when the user cancelled.
     */
    deleteTasks(parameters: ITaskDeleteParameters): Promise<IDeleteTasksResult | null>;
    /** Saves what changed on the task, its parent and rank included. */
    saveTask(task: IRecord): Promise<IRecordSaveOperationResult>;
    /** Opens the tasks in an editor outside the grid, `null` when nothing changed. */
    openTasks(taskIds: string[]): Promise<IOpenTasksResult | null>;
    /** Opens the record a task's lookup points to. */
    openRelatedRecord(reference: ComponentFramework.EntityReference, columnName: string): Promise<void>;
    /** What the backend changed since the store last read its tasks. */
    synchronize?(): Promise<ITaskChanges>;
}

/** What the task provider raises as its tree changes, ahead of any save. */
export interface ITaskDataProviderEvents {
    /** Fires when tasks join the tree, before the store has created a new one. */
    onTasksCreated: (records: IRecord[], parentId?: string) => void;
    /** Fires when tasks leave the tree, deleted or never created. */
    onTasksDeleted: (taskIds: string[]) => void;
    /** Fires when a task is placed, before its move saves. */
    onTaskMoved: (parameters: ITaskMoveParameters) => void;
    /** Fires when tasks take new values in place, whatever changed them. */
    onTasksUpdated: (records: IRecord[]) => void;
    /** Fires when the editor the tasks were opened in outside the grid closes. */
    onEditorClosed: (taskIds: string[]) => void;
    /** Fires when the visible tree changes without new data. */
    onTreeChanged: () => void;
}

export interface ITaskDataProviderParameters {
    store: ITaskStore;
    /** The formatting values are written and read with; the app user's when left out. */
    formatting?: IFormatting;
    /** `stateCode` defaults to `statecode`. */
    fieldMapping: Omit<IFieldMapping, 'stateCode'> & Partial<Pick<IFieldMapping, 'stateCode'>>;
    /** Scopes the tree to the subtree under this task, which the store has to load too. */
    rootTaskId?: string;
    /** Where a task created with no position of its own goes, `first` by default. */
    defaultCreatePosition?: TaskCreatePosition;
    /** How many hours a day of the duration column holds, unless its metadata says otherwise. */
    hoursPerDay?: number;
}

/** Adds to the available columns in place. */
export type TaskAvailableColumnsHook = (columns: IColumn[]) => void;

/** Loads and saves columns whose values are kept apart from the tasks. */
export interface ITaskColumnHandler {
    /** Whether the handler loads and saves the column. */
    isHandledColumn(columnName: string): boolean;
    /** The handled columns' values of these tasks, by task id and column name. */
    loadValues?(taskIds: string[]): Promise<Map<string, IRawRecord>>;
    saveValue(record: IRecord, column: IColumn, value: unknown): Promise<IRecordSaveOperationResult>;
}

/** Matches tasks against filters and quick find for columns kept apart from the tasks. */
export interface ITaskColumnMatcher {
    isHandledColumn(columnName: string): boolean;
    /** Whether the task matches a filter condition on a handled column. */
    isMatchingCondition(record: IRecord, condition: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression): boolean;
    /** Whether the task's value in a handled quick find column matches the search query. */
    isMatchingSearch(record: IRecord, columnName: string, searchQuery: string): boolean;
}

/** Holds the tasks back from the tree until it settles. */
export type TaskLoadWaiter = (parameters: { taskIds: string[] }) => Promise<void> | void;

export interface ITaskDataProviderHooks {
    /** Adds to the available columns that complete the columns of every view. */
    readonly availableColumns: IHookPoint<TaskAvailableColumnsHook>;
}

/** A provider of tasks, every task loaded at once and shown as a tree. */
export interface ITaskDataProvider extends IDataProvider {
    readonly taskEvents: IEventSubscriber<ITaskDataProviderEvents>;
    getFieldMapping(): IFieldMapping;
    /** How many hours a day of the duration column holds, unless its metadata says otherwise. */
    getHoursPerDay(): number | undefined;
    getStore(): ITaskStore;
    /** Every loaded task, whatever the view shows. */
    getAllRecords(): IRecord[];
    getRecordTree(): IRecordTree;
    /** The task the tree is scoped to, if any. */
    getRootTaskId(): string | undefined;
    /** The columns quick find searches, by name. */
    setQuickFindColumns(columnNames: string[]): void;
    areInactiveTasksHidden(): boolean;
    setInactiveTasksHidden(isHidden: boolean): Promise<void>;
    isRecordActive(recordId: string): boolean;
    /**
     * Shows a new task under `parentId` at once and has the store create it.
     * @returns The task, or `null` under a task the store has not created yet.
     */
    createTask(parentId?: string, parameters?: INewTaskParameters): IRecord | null;
    /** Whether the task is shown but the store has not created it yet. */
    isTaskPending(taskId: string): boolean;
    /** Resolves `false` when the store dropped the task and rejects when it failed. */
    whenTaskCreated(taskId: string): Promise<boolean>;
    /** Adds the tasks `create` makes in the backend under `parentId`. */
    createTasksWith(parentId: string | undefined, create: (parameters: ITaskCreateParameters) => Promise<ITasksCreateResult | null>, options?: { position?: TaskCreatePosition }): Promise<IRecord[] | null>;
    /** The position a task created since the view last loaded asked for. */
    getNewTaskPosition(taskId: string): TaskCreatePosition | undefined;
    getDeletion(taskIds: string[]): ITaskDeletion;
    /** Deletes the tasks and their subtrees bottom-up. */
    deleteTasks(taskIds: string[]): Promise<IDeleteTasksResult | null>;
    /** Places the task by setting its parent and rank, `null` when it cannot go there. */
    moveTask(movingTaskId: string, targetTaskId: string, position: ITaskMovePosition): IRecord | null;
    /** Opens the tasks in the store's editor outside the grid. */
    openTasks(taskIds: string[]): Promise<IOpenTasksResult | null>;
    /** Opens the record a task's lookup points to. */
    openRelatedRecord(reference: ComponentFramework.EntityReference, columnName: string): Promise<void>;
    /** Merges raw data into the loaded tasks by their primary id. */
    updateTaskData(rawRecords: IRawRecord[]): void;
    /** Applies what the store reports the backend changed. */
    synchronize(): Promise<void>;
    readonly hooks: ITaskDataProviderHooks;
    /** Loads and saves the columns the handler claims in place of the store. */
    addColumnHandler(handler: ITaskColumnHandler): () => void;
    /** Loads the column hidden, whatever the view shows. */
    addRequiredColumn(column: IColumn): () => void;
    /** Answers filters and quick find for the columns the matcher claims. */
    addColumnMatcher(matcher: ITaskColumnMatcher): () => void;
    /** Runs before every data load hands its tasks out, and is waited for. */
    addLoadWaiter(waiter: TaskLoadWaiter): () => void;
    /** Whether the current sorting, filtering or quick find reads the column. */
    isColumnQueried(columnName: string): boolean;
}
