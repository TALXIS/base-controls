import { EventEmitter, GetDataEvent, IAvailableColumnOptions, IAvailableRelatedColumn, IColumn, ICommand, IDataProvider, IDataProviderEventListeners, IEventBubbleOptions, IEventEmitter, IRawRecord, IRecord, IRecordSaveOperationResult, IRetrievedData, IRetrieveRecordCommandOptions, MemoryDataProvider, Operators, Type } from "@talxis/client-libraries";
import { IRecordTree, RecordTree } from "./record-tree/RecordTree";
import { ErrorHelper } from "@utils/error-handling";
import { ILocalizationService } from "@utils";
import { ITaskGridLabels } from "@components/TaskGrid/labels";
import { INativeColumns } from "@components/TaskGrid/interfaces";
import { ISavedQueryDataProvider} from "../saved-query";
import { ICustomColumnsDataProvider } from "@components/TaskGrid/modules/custom-columns/CustomColumnsDataProvider";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** One record an operation could not complete, and why. */
export interface IFailedRecord {
    id: string;
    error: any;
}

/** Outcome of a delete: which tasks went, and which failed. */
export type IDeleteTasksResult =
    | { success: true; deletedTaskIds: string[] }
    | { success: false; deletedTaskIds: string[]; errors: IFailedRecord[] };

/** Outcome of opening records: any that came back changed, and which failed. */
export type IOpenDatasetItemsResult =
    | { success: true; updatedRecords: IRawRecord[] }
    | { success: false; updatedRecords: IRawRecord[]; errors: IFailedRecord[] };


/**
 * Where an operation lands: the parent it ends up under, and the siblings around it, resolved over the
 * entire dataset so filtering and quick find cannot narrow them.
 *
 * The provider says which records the task lands between; how order is expressed is the strategy's. Read
 * whatever you order by off the neighbours — `previousSibling?.getValue(nativeColumns.stackRank)` for the
 * shipped lexicographic scheme, your own column for anything else.
 */
export interface ITaskSiblingContext {
    /**
     * The parent the task ends up under, or `undefined` for top level. `getRecordId()` is the id,
     * `getNamedReference()` the lookup value to store.
     */
    parentRecord?: IRecord;
    /** Every record under that parent, in order, excluding the task itself. */
    siblings: IRecord[];
    /** The sibling the task ends up immediately after, if any. */
    previousSibling?: IRecord;
    /** The sibling it ends up immediately before, if any. */
    nextSibling?: IRecord;
}

/** What the provider hands `onMoveTask`. */
export interface ITaskMoveParams extends ITaskSiblingContext {
    /** The task being moved. */
    movingTaskId: string;
    /** The task it was dropped on. */
    targetTaskId: string;
    /** Where it landed relative to the target. */
    position: 'above' | 'below' | 'child';
    /** The record being moved. */
    movingRecord: IRecord;
    /** The record it was dropped on. */
    targetRecord: IRecord;
}

/** What the provider hands `onCreateTask`. The sibling context is where the new task lands. */
export interface ITaskCreateParams extends ITaskSiblingContext {
}

/** Constructor parameters for {@link TaskDataProvider}. */
export interface ITaskDataProviderParameters {
    /** Every data access and mutation goes through it. */
    strategy: ITaskDataProviderStrategy;
    /** Where the column names, the labels and the other providers are reached. */
    services: ITaskGridServiceLocator;
    onIsFlatListEnabled: () => boolean;
}

/** Strategy interface that handles all data access and mutation operations for tasks. */
export interface ITaskDataProviderStrategy {
    /**
     * Called when the provider needs to retrieve latest data for specific tasks to synchronize the grid with the server.
     */
    onGetRawRecords: (ids: string[]) => Promise<IRawRecord[]>;
    /** Called once on first load. Must return the initial columns, raw task records, and entity metadata. */
    onInitialize: (provider: ITaskDataProvider) => Promise<{ columns: IColumn[]; rawData: IRawRecord[]; metadata: any }>
    /** Returns all columns available for display in the grid (both native and custom). */
    onGetAvailableColumns: (options?: IAvailableColumnOptions) => Promise<IColumn[]>;
    /** Returns linked-entity columns that can be used for filtering and sorting. */
    onGetAvailableRelatedColumns: () => Promise<IAvailableRelatedColumn[]>;
    /**
     * Creates one task where {@link ITaskCreateParams} says — before every existing sibling, whether the
     * active view shows them or not.
     *
     * @returns The created raw record, or `null` when the user cancelled.
     */
    onCreateTask(params: ITaskCreateParams): Promise<IRawRecord | null>;
    /**
     * @returns Result indicating which tasks were deleted and which failed.
     * `success: true` means all tasks were deleted. `success: false` means some or all failed.
     * Throws on unexpected failure.
     */
    onDeleteTasks(taskIds: string[]): Promise<IDeleteTasksResult | null>;
    /**
     * Opens one or more dataset items. When `isTaskEntity` is `true` the references point to task records;
     * when `false` they point to a related entity (e.g. a lookup target).
     */
    onOpenDatasetItems(entityReferences: ComponentFramework.EntityReference[], isTaskEntity: boolean): Promise<IOpenDatasetItemsResult | null>;
    /**
     * Moves a task to a new position relative to another. {@link ITaskMoveParams} carries the neighbours
     * it lands between, resolved over the whole dataset — a move into the task's own subtree never
     * reaches here, the provider refuses it first.
     *
     * @returns The updated raw records, or `null` on cancellation.
     */
    onMoveTask(params: ITaskMoveParams): Promise<IRawRecord[] | null>;
    /** Persists inline cell edits for the given record. */
    onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult>;
    /** Returns whether the given task record is currently active (non-completed). */
    onIsRecordActive(recordId: string): boolean;
    /**
     * Called just before the provider is torn down — on unmount, and on every remount. The provider's data
     * is still readable, so this is the strategy's last chance to hand the current records to whoever
     * keeps them.
     */
    onDestroy?: () => void;
    /** When provided, the task tree is scoped to the subtree of the returned task id. */
    onGetRootTaskId?: () => string | undefined
}

/** The task events, raised before and after each operation. Forwarded to the matching `ITaskGridProps` prop. */
export interface ITaskDataProviderEventListener {
    onBeforeTasksDeleted: (taskIds: string[]) => void;
    onAfterTasksDeleted: (result: IDeleteTasksResult | null) => void;
    onBeforeTasksCreated: (parentId?: string) => void;
    onAfterTasksCreated: (records: IRawRecord[] | null, parentId?: string) => void;
    onBeforeTaskMoved: () => void;
    /**
     * @param result The changed records, or `null` when the task did not move: the grid refused the drop,
     * or the strategy returned nothing. Raised either way, so a listener that paired it with
     * `onBeforeTaskMoved` still sees its end - check the result before acting on the move.
     */
    onAfterTaskMoved: (movingFromTaskId: string, movingToTaskId: string, position: 'above' | 'below' | 'child', result: IRawRecord[] | null) => void;
    onTaskDataUpdated: (data: IRawRecord[]) => void;
    onRecordTreeUpdated: (updatedParentIds: (string | undefined)[]) => void;
    onBeforeDatasetItemsOpened: (entityReferences: ComponentFramework.EntityReference[], isTaskEntity: boolean) => void;
    onAfterDatasetItemsOpened: (entityReferences: ComponentFramework.EntityReference[], isTaskEntity: boolean, result: IOpenDatasetItemsResult | null) => void;
    onError: (error: any, message: string) => void;
}

/** Extended data provider interface for task records. Adds task-specific operations on top of `IDataProvider`. */
export interface ITaskDataProvider extends IDataProvider {
    /** EventEmitter for task lifecycle events (create, delete, edit, move, error). */
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
     * Opens one or more task records by id. Builds entity references from the current records map
     * and delegates to `strategy.onOpenDatasetItems` with `isTaskEntity: true`.
     */
    openTaskItems(taskIds: string[]): Promise<IOpenDatasetItemsResult | null>;
    /** @returns The created task raw record, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    createTask(parentTaskId?: string): Promise<IRawRecord | null>;
    /**
     * @returns Result indicating which tasks were deleted and which failed.
     * `success: true` means all tasks were deleted. `success: false` means some or all failed — `deletedTaskIds` still contains the ids that succeeded.
     * Throws on unexpected failure before any deletes could be attempted.
     */
    deleteTasks(taskIds: string[]): Promise<IDeleteTasksResult | null>;
    /** Returns `true` when the grid is displaying a flat list instead of a tree hierarchy. */
    isFlatListEnabled(): boolean;
    /** Returns the root task id when the tree is scoped to a subtree, or `null` for a full tree. */
    getRootTaskId: () => string | null;
    /** Moves a task to a position relative to another task. Returns the updated raw records, or `null` on cancellation. */
    moveTask(movingTaskId: string, movingToTaskId: string, position: 'above' | 'below' | 'child'): Promise<IRawRecord[] | null>;
}

/**
 * The grid's data layer: holds the loaded tasks, maintains the hierarchy, and routes every operation
 * through the descriptor's task strategy.
 */
export class TaskDataProvider extends MemoryDataProvider implements ITaskDataProvider {
    private _services: ITaskGridServiceLocator;
    private _hasDataBeenLoaded: boolean = false;
    private _taskTree: RecordTree;
    private _strategy: ITaskDataProviderStrategy;
    private _onFlatListEnabled: () => boolean;
    public readonly taskEvents: EventEmitter<ITaskDataProviderEventListener> = new EventEmitter<ITaskDataProviderEventListener>();

    constructor(parameters: ITaskDataProviderParameters) {
        super({
            dataSource: [],
            metadata: { PrimaryIdAttribute: 'id' }
        });
        this._services = parameters.services;
        this._taskTree = new RecordTree({
            taskDataProvider: this
        })
        this._strategy = parameters.strategy;
        this._onFlatListEnabled = parameters.onIsFlatListEnabled;
        this._registerTaskEventListeners();
    }

    private get _nativeColumns(): INativeColumns {
        return this._services.get('nativeColumns');
    }

    private get _localizationService(): ILocalizationService<ITaskGridLabels> {
        return this._services.get('localizationService');
    }

    private get _savedQueryDataProvider(): ISavedQueryDataProvider {
        return this._services.get('savedQueryDataProvider');
    }

    /** The user-defined columns, when the custom-columns module is registered. */
    private get _customColumnsDataProvider(): ICustomColumnsDataProvider | undefined {
        return this._services.find('customColumnsModule')?.provider;
    }

    public getStrategy<T extends ITaskDataProviderStrategy>(): T {
        return this._strategy as T;
    }

    public getRootTaskId(): string | null {
        return this._strategy.onGetRootTaskId?.() ?? null;
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

    public async onGetAvailableColumns(options?: { entityName?: string }): Promise<IColumn[]> {
        return [
            ...this._getColumnsWithUnusedVirtualColumns(await this._strategy.onGetAvailableColumns(options)),
            ...(this._customColumnsDataProvider ? this._customColumnsDataProvider.getColumns() : [])
        ];
    }

    private _getColumnsWithUnusedVirtualColumns(columns: IColumn[]): IColumn[] {
        columns = [...columns];
        const columnsMap = new Map(columns.map(col => [col.name, col]));
        const virtualColumns = new Map(this._savedQueryDataProvider.getSystemQueries().flatMap(query => query.columns).filter(column => column.isVirtual).map(col => [col.name, col]));
        for (const virtualColumn of [...virtualColumns.values()]) {
            if (!columnsMap.has(virtualColumn.name)) {
                columns.push({
                    ...virtualColumn,
                    isHidden: false
                });
            }
        }
        return columns;
    }

    public onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
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
                const params = this._resolveMove(movingFromTaskId, movingToTaskId, position);
                if (!params) {
                    //an impossible move - into the task's own subtree, or onto a record we do not hold.
                    //Refused here so no strategy has to guard against it
                    this.taskEvents.dispatchEvent('onAfterTaskMoved', movingFromTaskId, movingToTaskId, position, null);
                    return null;
                }
                const result = await this._strategy.onMoveTask(params);
                if (result !== null) this.updateTaskData(result);
                this.taskEvents.dispatchEvent('onAfterTaskMoved', movingFromTaskId, movingToTaskId, position, result);
                return result;
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        })
    }

    /**
     * Resolves where a drop lands: the parent, and the siblings on either side of it, taken from the
     * complete record set rather than the filtered view.
     *
     * @returns `null` when the move cannot be made.
     */
    private _resolveMove(movingTaskId: string, targetTaskId: string, position: 'above' | 'below' | 'child'): ITaskMoveParams | null {
        const movingRecord = this.getRecordsMap()[movingTaskId];
        const targetRecord = this.getRecordsMap()[targetTaskId];
        if (!movingRecord || !targetRecord) {
            return null;
        }
        //a task cannot become its own descendant: the hierarchy would cycle, and the record tree drops
        //every record in a cycle - the rows would simply vanish. `pathIds` runs from the root down to the
        //target itself, over the unfiltered records, so this covers dropping a task onto itself as well
        if (this._taskTree.structure.getAncestorIds(targetTaskId).includes(movingTaskId)) {
            return null;
        }

        const structure = this._taskTree.structure;
        const parentTaskId = position === 'child'
            ? targetTaskId
            : structure.getParent(targetTaskId)?.getRecordId() ?? null;
        const siblings = structure.getChildren(parentTaskId)
            .filter(record => record.getRecordId() !== movingTaskId);
        //the moving task is excluded, so it is never weighed against the position it is leaving
        const neighbours = structure.getNeighbours(targetTaskId, { exclude: movingTaskId });
        const [previousSibling, nextSibling] = position === 'child'
            //first among its new children, so there is nothing before it
            ? [undefined, siblings[0]]
            : position === 'above'
                ? [neighbours.previous, targetRecord]
                : [targetRecord, neighbours.next];

        return {
            movingTaskId,
            targetTaskId,
            position,
            movingRecord,
            targetRecord,
            parentRecord: parentTaskId ? this.getRecordsMap()[parentTaskId] : undefined,
            siblings,
            previousSibling,
            nextSibling,
        };
    }

    /** Where a newly created task lands: first among every existing child of its parent. */
    private _resolveCreate(parentTaskId?: string): ITaskCreateParams {
        const siblings = this._taskTree.structure.getChildren(parentTaskId ?? null);
        return {
            parentRecord: parentTaskId ? this.getRecordsMap()[parentTaskId] : undefined,
            siblings,
            previousSibling: undefined,
            nextSibling: siblings[0],
        };
    }

    public async createTask(parentId?: string): Promise<IRawRecord | null> {
        this.taskEvents.dispatchEvent('onBeforeTasksCreated', parentId);
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const rawRecord = await this._strategy.onCreateTask(this._resolveCreate(parentId));
                if (rawRecord) this._createTasks([rawRecord], parentId);
                this.taskEvents.dispatchEvent('onAfterTasksCreated', rawRecord ? [rawRecord] : null, parentId);
                return rawRecord;
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        });
    }

    public async onOpenDatasetItem(entityReference: ComponentFramework.EntityReference, context?: { columnName?: string }): Promise<void> {
        const isTaskEntity = !context || context?.columnName === this.getNativeColumns().subject;
        this.taskEvents.dispatchEvent('onBeforeDatasetItemsOpened', [entityReference], isTaskEntity);
        ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const result = await this._strategy.onOpenDatasetItems([entityReference], isTaskEntity);
                if(result) this.updateTaskData(result.updatedRecords);
                this.taskEvents.dispatchEvent('onAfterDatasetItemsOpened', [entityReference], isTaskEntity, result);
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        });
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
        return this._taskTree.view.getOrderedIds();
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

    public async openTaskItems(taskIds: string[]): Promise<IOpenDatasetItemsResult | null> {
        const entityReferences = taskIds.map(id => {
            const record = this.getRecordsMap()[id];
            return {
                id: { guid: id },
                etn: this.getEntityName(),
                name: record?.getFormattedValue(this.getNativeColumns().subject) ?? undefined
            } as ComponentFramework.EntityReference;
        });
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                this.taskEvents.dispatchEvent('onBeforeDatasetItemsOpened', entityReferences, true);
                const result = await this._strategy.onOpenDatasetItems(entityReferences, true);
                if (result !== null) this.updateTaskData(result.updatedRecords);
                this.taskEvents.dispatchEvent('onAfterDatasetItemsOpened', entityReferences, true, result);
                return result;
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        });
    }

    public isRecordActive(recordId: string): boolean {
        return this._strategy.onIsRecordActive(recordId);
    }

    public async destroy(): Promise<void> {
        //before super, which drops the data: this is the strategy's last look at it
        this._strategy.onDestroy?.();
        super.destroy();
        this.taskEvents.clearEventListeners();
    }

    public getQuickFindColumns(): IColumn[] {
        const quickFindColumnNames = this._savedQueryDataProvider.getCurrentQuery().quickFindColumns ?? [];
        const existingQuickFindColumns = quickFindColumnNames.map(columnName => this.getColumnsMap()[columnName]).filter(col => col) as IColumn[];
        return existingQuickFindColumns;
    }

    public createGroupedRecordDataProvider(group: IRecord): IDataProvider {
        const children = this._taskTree.view.getChildren(group.getRecordId());
        return {
            ...this,
            getRecords: () => children,
            isError: () => this.isError(),
            refresh: () => children
        } as IDataProvider;
    }

    public getPaging() {
        const paging = super.getPaging();
        paging.totalResultCount = this._taskTree.view.getCount()
        paging.pageSize = this._taskTree.view.getCount();
        return paging;
    }

    public getRecords(): IRecord[] {
        const records = super.getRecords();
        if (records.length === 0 || !this._taskTree.isBuilt()) {
            return [];
        }
        return this._taskTree.view.getChildren();
    }

    public getAllRecords(): IRecord[] {
        return super.getRecords();
    }

    public createNewDataProvider(eventBubbleOptions?: IEventBubbleOptions): IDataProvider {
        return new TaskDataProvider({
            strategy: this._strategy,
            services: this._services,
            onIsFlatListEnabled: () => this._onFlatListEnabled(),
        });
    }
    public async refresh(): Promise<IRecord[]> {
        if (!this._hasDataBeenLoaded) {
            await this._loadDataFromStrategy();
            //we need to artificially wait in order for any sync outside stuff to finish (like loading grid  to register events)
            await new Promise(resolve => setTimeout(resolve, 0));
            this._hasDataBeenLoaded = true;
        }
        await super.refresh();
        return this.getAllRecords();
    }

    public dispatchEvent<K extends keyof IDataProviderEventListeners>(event: K, ...args: Parameters<IDataProviderEventListeners[K]>): boolean {
        if (event === 'onNewDataLoaded') {
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

    /** Subscribes to everything the provider reacts to, once, at construction. */
    private _registerTaskEventListeners(): void {
        //expanding a template is what creates the tasks it describes: subscribed before anything else
        //gets the chance, so every later listener sees tasks that already exist.
        //
        //Waited for rather than resolved: this runs from a constructor, where nothing can be assumed to
        //be registered yet. A module that is never registered simply never fires
        this._services.whenAvailable('templatesModule', module => {
            module.provider.templateEvents.addEventListener(
                'onAfterTasksFromTemplateCreated',
                (rawRecords, parentTaskId) => this._createTasksFromTemplate(rawRecords, parentTaskId),
            );
        });
    }

    /**
     * Adds the tasks a template expanded into, raising the same events a task creation does.
     *
     * The records arrive finished — what they hold and where they sit is the template provider's — so
     * this only adds them.
     */
    private async _createTasksFromTemplate(rawRecords: IRawRecord[] | null, parentTaskId?: string): Promise<void> {
        if (!rawRecords?.length) {
            return;
        }
        this.taskEvents.dispatchEvent('onBeforeTasksCreated', parentTaskId);
        await ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                this._createTasks(rawRecords, parentTaskId);
                this.taskEvents.dispatchEvent('onAfterTasksCreated', rawRecords, parentTaskId);
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        });
    }

    private _createTasks(rawRecords: IRawRecord[], parentId?: string) {
        const records: IRecord[] = [];
        for (const rawRecord of rawRecords) {
            const record = this.newRecord({
                rawData: rawRecord,
                recordId: rawRecord[this.getMetadata().PrimaryIdAttribute],
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