import { EventEmitter, GetDataEvent, IAvailableColumnOptions, IAvailableRelatedColumn, IColumn, ICommand, IDataProvider, IDataProviderEventListeners, IEventBubbleOptions, IEventEmitter, IRawRecord, IRecord, IRecordSaveOperationResult, IRetrievedData, IRetrieveRecordCommandOptions, MemoryDataProvider, Operators, Type } from "@talxis/client-libraries";
import { IRecordTree, RecordTree } from "./record-tree/RecordTree";
import { ErrorHelper } from "../../../../utils/error-handling";
import { ILocalizationService, ITaskGridLabels } from "../../labels";
import { INativeColumns } from "../../interfaces";

export interface IFailedRecord {
    id: string;
    error: any;
}

export type IDeleteTasksResult =
    | { success: true; deletedTaskIds: string[] }
    | { success: false; deletedTaskIds: string[]; errors: IFailedRecord[] };

export type IEditTasksResult =
    | { success: true; updatedRecords: IRawRecord[] }
    | { success: false; updatedRecords: IRawRecord[]; errors: IFailedRecord[] };


export interface ITaskDataProviderParameters {
    nativeColumns: INativeColumns;
    localizationService: ILocalizationService<ITaskGridLabels>;
    strategy: ITaskDataProviderStrategy;
    onIsFlatListEnabled: () => boolean;
}

/** Strategy interface that handles all data access and mutation operations for tasks. */
export interface ITaskDataProviderStrategy {
    /**
     * Called once on first load. Must return the initial columns, raw task records, and provider metadata.
     * An empty `ids` array instructs the strategy to fetch all records.
     */
    onGetRawRecords: (ids: string[]) => Promise<IRawRecord[]>;
    /** Called once on first load. Must return the initial columns, raw task records, and entity metadata. */
    onInitialize: (provider: ITaskDataProvider) => Promise<{ columns: IColumn[]; rawData: IRawRecord[]; metadata: any }>
    /** Returns all columns available for display in the grid (both native and custom). */
    onGetAvailableColumns: (options?: IAvailableColumnOptions) => Promise<IColumn[]>;
    /** Returns linked-entity columns that can be used for filtering and sorting. */
    onGetAvailableRelatedColumns: () => Promise<IAvailableRelatedColumn[]>;
    /** Returns the attribute names that are searched when the user types in the quick-find input. */
    onGetQuickFindColumns: () => string[];
    /** @returns The created task raw record, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onCreateTask(parentTaskId?: string): Promise<IRawRecord | null>;
    /**
     * @returns Result indicating which tasks were deleted and which failed.
     * `success: true` means all tasks were deleted. `success: false` means some or all failed.
     * Throws on unexpected failure.
     */
    onDeleteTasks(taskIds: string[]): Promise<IDeleteTasksResult | null>;
    /** @returns The created template raw record, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onCreateTemplateFromTask(taskId: string): Promise<IRawRecord | null>;
    /** @returns The created task raw records, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onCreateTasksFromTemplate(templateId: string, parentTaskId?: string): Promise<IRawRecord[] | null>;
    /**
     * @returns Result indicating which tasks were updated and which failed, or `null` if the operation was cancelled by the user.
     * `success: true` means all tasks were updated. `success: false` means some or all failed.
     * Throws on unexpected failure.
     */
    onEditTasks(taskIds: string[]): Promise<IEditTasksResult | null>;
    /** Moves a task to a new position relative to another task. Returns the updated raw records, or `null` on cancellation. */
    onMoveTask(movingTaskId: string, movingToTaskId: string, position: 'above' | 'below' | 'child'): Promise<IRawRecord[] | null>;
    /** Persists inline cell edits for the given record. */
    onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult>;
    /** Returns whether the given task record is currently active (non-completed). */
    onIsRecordActive(recordId: string): boolean;
    /** Opens the record detail view. Called when a user clicks a non-subject cell. */
    onOpenDatasetItem(entityReference: ComponentFramework.EntityReference, context?: { columnName?: string }): void;
    /** Return `false` to disable task creation (hide the *New* button). Defaults to `true`. */
    onIsTaskAddingEnabled?(): boolean;
    /** Return `false` to disable inline cell editing. Defaults to `true`. */
    onIsTaskEditingEnabled?(): boolean;
    /** Return `false` to disable task deletion (hide the *Delete* button). Defaults to `true`. */
    onIsTaskDeletingEnabled?(): boolean;
    /** When provided, the task tree is scoped to the subtree of the returned task id. */
    onGetRootTaskId?: () => string | undefined
}

export interface ITaskDataProviderEventListener {
    onBeforeTemplateCreated: (taskId: string) => void;
    onAfterTemplateCreated: (record: IRawRecord | null) => void;
    onBeforeTasksDeleted: (taskIds: string[]) => void;
    onAfterTasksDeleted: (result: IDeleteTasksResult | null) => void;
    onBeforeTasksCreated: (parentId?: string) => void;
    onAfterTasksCreated: (records: IRawRecord[] | null, parentId?: string) => void;
    onBeforeTaskMoved: () => void;
    onAfterTaskMoved: (movingFromTaskId: string, movingToTaskId: string, position: 'above' | 'below' | 'child') => void;
    onBeforeTasksEdited: (taskIds: string[]) => void;
    onTaskDataUpdated: (data: IRawRecord[]) => void;
    onAfterTasksEdited: (result: IEditTasksResult | null) => void;
    onRecordTreeUpdated: (updatedParentIds: (string | undefined)[]) => void;
    onError: (error: any, message: string) => void;
}

/** Extended data provider interface for task records. Adds task-specific operations on top of `IDataProvider`. */
export interface ITaskDataProvider extends IDataProvider {
    /** EventEmitter for task lifecycle events (create, delete, edit, move, template, error). */
    taskEvents: IEventEmitter<ITaskDataProviderEventListener>;
    /** Returns the native column name mapping. */
    getNativeColumns(): INativeColumns;
    /** Returns all records regardless of current tree filtering or paging. */
    getAllRecords(): IRecord[];
    /** Returns the underlying strategy cast to the given type. */
    getStrategy<T extends ITaskDataProviderStrategy>(): T;
    /** Fetches raw task records by id via the strategy. Pass an empty array to fetch all. */
    fetchRawRecords(ids: string[]): Promise<IRawRecord[]>;
    /** Returns the current hierarchical record tree built from loaded task data. */
    getRecordTree(): IRecordTree;
    /** Applies updated raw record data in-place and rebuilds the tree if hierarchy changed. */
    updateTaskData(newData: IRawRecord[]): void;
    /**
     * @returns Result indicating which tasks were updated and which failed, or `null` if the operation was cancelled by the user.
     * `success: true` means all tasks were updated. `success: false` means some or all failed — `updatedRecords` still contains the records that succeeded.
     * Throws on unexpected failure.
     */
    editTasks(taskIds: string[]): Promise<IEditTasksResult | null>;
    /** @returns The created task raw record, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    createTask(parentTaskId?: string): Promise<IRawRecord | null>;
    /**
     * @returns Result indicating which tasks were deleted and which failed.
     * `success: true` means all tasks were deleted. `success: false` means some or all failed — `deletedTaskIds` still contains the ids that succeeded.
     * Throws on unexpected failure before any deletes could be attempted.
     */
    deleteTasks(taskIds: string[]): Promise<IDeleteTasksResult | null>;
    /** @returns The created template raw record, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    createTemplateFromTask(taskId: string): Promise<IRawRecord | null>;
    /** @returns The created task raw records, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    createTasksFromTemplate(templateId: string, parentId?: string): Promise<IRawRecord[] | null>;
    /** Returns `true` when the grid is displaying a flat list instead of a tree hierarchy. */
    isFlatListEnabled(): boolean;
    /** Returns `true` when task creation is allowed (from `ITaskDataProviderStrategy.onIsTaskAddingEnabled`). */
    isTaskAddingEnabled(): boolean;
    /** Returns `true` when inline cell editing is allowed (from `ITaskDataProviderStrategy.onIsTaskEditingEnabled`). */
    isTaskEditingEnabled(): boolean;
    /** Returns `true` when task deletion is allowed (from `ITaskDataProviderStrategy.onIsTaskDeletingEnabled`). */
    isTaskDeletingEnabled(): boolean;
    /** Returns the root task id when the tree is scoped to a subtree, or `null` for a full tree. */
    getRootTaskId: () => string | null;
    /** Moves a task to a position relative to another task. Returns the updated raw records, or `null` on cancellation. */
    moveTask(movingTaskId: string, movingToTaskId: string, position: 'above' | 'below' | 'child'): Promise<IRawRecord[] | null>;
}

export class TaskDataProvider extends MemoryDataProvider implements ITaskDataProvider {
    private _nativeColumns: INativeColumns;
    private _localizationService: ILocalizationService<ITaskGridLabels>;
    private _hasDataBeenLoaded: boolean = false;
    private _taskTree: IRecordTree;
    private _strategy: ITaskDataProviderStrategy;
    private _onFlatListEnabled: () => boolean;
    public readonly taskEvents: EventEmitter<ITaskDataProviderEventListener> = new EventEmitter<ITaskDataProviderEventListener>();

    constructor(parameters: ITaskDataProviderParameters) {
        super({
            dataSource: [],
            metadata: { PrimaryIdAttribute: 'id' }
        })
        this._nativeColumns = parameters.nativeColumns;
        this._taskTree = new RecordTree({
            taskDataProvider: this
        })
        this._localizationService = parameters.localizationService;
        this._strategy = parameters.strategy;
        this._onFlatListEnabled = parameters.onIsFlatListEnabled;
    }

    public getStrategy<T extends ITaskDataProviderStrategy>(): T {
        return this._strategy as T;
    }

    public getRootTaskId(): string | null {
        return this._strategy.onGetRootTaskId?.() ?? null;
    }

    public isTaskAddingEnabled(): boolean {
        return this._strategy.onIsTaskAddingEnabled?.() ?? true;
    }

    public isTaskEditingEnabled(): boolean {
        return this._strategy.onIsTaskEditingEnabled?.() ?? true;
    }

    public isTaskDeletingEnabled(): boolean {
        return this._strategy.onIsTaskDeletingEnabled?.() ?? true;
    }

    public getRecordTree(): IRecordTree {
        return this._taskTree;
    }

    public isFlatListEnabled(): boolean {
        return this._onFlatListEnabled();
    }

    public getNativeColumns(): INativeColumns {
        return this._nativeColumns;
    }

    public async fetchRawRecords(ids: string[]) {
        return this._strategy.onGetRawRecords(ids);
    }

    public getAvailableColumns(options?: IAvailableColumnOptions): Promise<IColumn[]> {
        return this._strategy.onGetAvailableColumns(options);
    }

    public getAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return this._strategy.onGetAvailableRelatedColumns();
    }

    public async retrieveRecordCommand(options?: IRetrieveRecordCommandOptions): Promise<ICommand[]> {
        return [];
    }

    public onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        return this._strategy.onRecordSave(record);
    }

    public updateTaskData(newData: IRawRecord[]) {
        const affectedParentIds: (string | undefined)[] = [];
        let recordTreeChanged = false;

        for (const updatedData of newData) {
            const recordId = updatedData[this.getMetadata().PrimaryIdAttribute];
            if (!recordId) {
                throw new Error(`Updated data is missing record id. Data: ${JSON.stringify(updatedData)}`);
            }
            const record = this.getRecordsMap()[recordId];
            const originalParentId = record.getValue(this.getNativeColumns().parentId)?.[0]?.id?.guid;
            const originalStackRank = record.getValue(this.getNativeColumns().stackRank);
            record.setRawData(updatedData);
            const newParentId = record.getValue(this.getNativeColumns().parentId)?.[0]?.id?.guid;
            const newStackRank = record.getValue(this.getNativeColumns().stackRank);
            if (originalParentId !== newParentId) {
                recordTreeChanged = true;
                affectedParentIds.push(recordId, originalParentId, newParentId);
            } else if (originalStackRank !== newStackRank) {
                recordTreeChanged = true;
            }
        }
        if (recordTreeChanged) {
            this._taskTree.build();
            this.taskEvents.dispatchEvent('onRecordTreeUpdated', affectedParentIds);
        }
        this.taskEvents.dispatchEvent('onTaskDataUpdated', newData);
    }


    public getGroupedRecordDataProvider(groupedRecordId: string): IDataProvider | null {
        const provider = new MemoryDataProvider({
            dataSource: [],
            metadata: { PrimaryIdAttribute: 'id' }
        })
        provider.getErrorMessage = () => this.getErrorMessage();
        return provider;
    }

    public async moveTask(movingFromTaskId: string, movingToTaskId: string, position: "above" | "below" | "child"): Promise<IRawRecord[] | null> {
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                this.taskEvents.dispatchEvent('onBeforeTaskMoved');
                const result = await this._strategy.onMoveTask(movingFromTaskId, movingToTaskId, position);
                if (result !== null) this.updateTaskData(result);
                this.taskEvents.dispatchEvent('onAfterTaskMoved', movingFromTaskId, movingToTaskId, position);
                return result;
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        })
    }

    public async createTask(parentId?: string): Promise<IRawRecord | null> {
        this.taskEvents.dispatchEvent('onBeforeTasksCreated', parentId);
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const rawRecord = await this._strategy.onCreateTask(parentId);
                if (rawRecord) this._createTasks([rawRecord], parentId);
                this.taskEvents.dispatchEvent('onAfterTasksCreated', rawRecord ? [rawRecord] : null, parentId);
                return rawRecord;
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        });
    }

    public async createTasksFromTemplate(templateId: string, parentId?: string): Promise<IRawRecord[] | null> {
        this.taskEvents.dispatchEvent('onBeforeTasksCreated', parentId);
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const rawRecords = await this._strategy.onCreateTasksFromTemplate(templateId, parentId);
                if (rawRecords) this._createTasks(rawRecords, parentId);
                this.taskEvents.dispatchEvent('onAfterTasksCreated', rawRecords, parentId);
                return rawRecords;
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        })
    }

    public async createTemplateFromTask(taskId: string): Promise<IRawRecord | null> {
        this.taskEvents.dispatchEvent('onBeforeTemplateCreated', taskId);
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const rawRecord = await this._strategy.onCreateTemplateFromTask(taskId);
                this.taskEvents.dispatchEvent('onAfterTemplateCreated', rawRecord);
                return rawRecord;
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        });
    }

    public openDatasetItem(entityReference: ComponentFramework.EntityReference, context?: { columnName?: string }): void {
        if (!context || context?.columnName === this.getNativeColumns().subject) {
            this.editTasks([entityReference.id.guid]);
        }
        else {
            this._strategy.onOpenDatasetItem(entityReference);
        }
    }

    public getSorting(): ComponentFramework.PropertyHelper.DataSetApi.SortStatus[] {
        const sorting = super.getSorting();
        if (sorting.length === 0) {
            return [{
                name: this._nativeColumns.stackRank,
                sortDirection: 0
            }];
        }
        else {
            return sorting;
        }
    }

    public getSortedRecordIds(): string[] {
        return this._taskTree.getSortedIds();
    }

    public async deleteTasks(taskIds: string[]): Promise<IDeleteTasksResult | null> {
        this.taskEvents.dispatchEvent('onBeforeTasksDeleted', taskIds);
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const result = await this._strategy.onDeleteTasks(taskIds);
                if (result !== null) {
                    const deletedTaskIds = result.deletedTaskIds;
                    await this.deleteRecords(deletedTaskIds);
                    this.setSelectedRecordIds(this.getSelectedRecordIds().filter(id => !deletedTaskIds.includes(id)));
                    this._taskTree.build();
                    this.taskEvents.dispatchEvent('onRecordTreeUpdated', deletedTaskIds);
                }
                this.taskEvents.dispatchEvent('onAfterTasksDeleted', result);
                return result;
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        })
    }

    public async editTasks(taskIds: string[]): Promise<IEditTasksResult | null> {
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                this.taskEvents.dispatchEvent('onBeforeTasksEdited', taskIds);
                const result = await this._strategy.onEditTasks(taskIds);
                if (result !== null) this.updateTaskData(result.updatedRecords);
                this.taskEvents.dispatchEvent('onAfterTasksEdited', result);
                return result;
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        })
    }

    public isRecordActive(recordId: string): boolean {
        return this._strategy.onIsRecordActive(recordId);
    }

    public onOpenDatasetItem(entityReference: ComponentFramework.EntityReference): void {
        if (entityReference.etn === this.getEntityName()) {
            this.editTasks([entityReference.id.guid]);
        }
        else {
            //@ts-ignore - typings
            this._sourceDataProvider.onOpenDatasetItem(entityReference);
        }
    }

    public async destroy(): Promise<void> {
        super.destroy();
        this.taskEvents.clearEventListeners();
    }

    public getQuickFindColumns(): IColumn[] {
        return this._strategy.onGetQuickFindColumns().map(columnName => {
            return this.getColumnsMap()[columnName];
        }).filter(col => col) as IColumn[];
    }

    public createGroupedRecordDataProvider(group: IRecord): IDataProvider {
        const children = this._taskTree.getNodeMap().get(group.getRecordId())?.directChildren ?? [];
        return {
            ...this,
            getRecords: () => children,
            isError: () => this.isError(),
            refresh: () => children
        } as IDataProvider;
    }

    public getPaging() {
        const paging = super.getPaging();
        paging.totalResultCount = this._taskTree.getTotalCount()
        paging.pageSize = this._taskTree.getTotalCount();
        return paging;
    }

    public getRecords(): IRecord[] {
        const records = super.getRecords();
        if (records.length === 0 || this._taskTree.getNodeMap().size === 0) {
            return [];
        }
        return this._taskTree.getNodeMap().get(null as any)?.directChildren ?? [];
    }

    public getAllRecords(): IRecord[] {
        return super.getRecords();
    }

    public createNewDataProvider(eventBubbleOptions?: IEventBubbleOptions): IDataProvider {
        return new TaskDataProvider({
            localizationService: this._localizationService,
            nativeColumns: this._nativeColumns,
            strategy: this._strategy,
            onIsFlatListEnabled: () => this._onFlatListEnabled(),
        });
    }
    public async refresh(): Promise<IRecord[]> {
        if (!this._hasDataBeenLoaded) {
            await this._loadDataFromStrategy();
            this._hasDataBeenLoaded = true;
        }
        await super.refresh();
        return this.getAllRecords();
    }

    public dispatchEvent<K extends keyof IDataProviderEventListeners>(event: K, ...args: Parameters<IDataProviderEventListeners[K]>): boolean {
        if(event === 'onNewDataLoaded') {
            this._taskTree.build();
        }
        return super.dispatchEvent(event, ...args);
    }

    public getDataSync(pageNumber: number, pageSize: number, previousPageNumber: number, event: GetDataEvent): IRetrievedData {
        return {
            data: this.getDataSource(),
            hasNextPage: false,
            totalRecordCount: this.getDataSource().length
        }
    }

    private async _loadDataFromStrategy() {
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const { columns, rawData, metadata } = await this._strategy.onInitialize(this);
                this.setDataSource(rawData);
                this.setMetadata(metadata);
                this.setColumns(columns);
                this.getPaging().setPageSize(rawData.length);
                this.setEntityName(metadata.LogicalName);
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        })
    }

    private _createTasks(rawRecords: IRawRecord[], parentId?: string) {
        const records: IRecord[] = [];
        for (const rawRecord of rawRecords) {
            const record = this.newRecord({
                rawData: rawRecord,
                recordId: rawRecord[this.getMetadata().PrimaryIdAttribute],
                position: 'start',
            },);
            const stackRankAttributeName = this.getNativeColumns().stackRank;
            if (record.getValue(stackRankAttributeName) == null) {
                console.warn(`Record with id ${record.getRecordId()} is missing stack rank value. Setting it to 0.`, record);
                record.setValue(stackRankAttributeName, 0);
                const newRawData = record.toRawData()
                record.setRawData(newRawData);
            }
            records.push(record);
        }
        if (records.length > 0) {
            this._taskTree.build();
            this.taskEvents.dispatchEvent('onRecordTreeUpdated', [parentId]);
        }
    }
}