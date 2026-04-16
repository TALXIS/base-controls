import { EventEmitter, GetDataEvent, IAvailableColumnOptions, IAvailableRelatedColumn, IColumn, ICommand, IDataProvider, IDataProviderEventListeners, IEventBubbleOptions, IEventEmitter, IRawRecord, IRecord, IRecordSaveOperationResult, IRetrievedData, IRetrieveRecordCommandOptions, MemoryDataProvider, Operators, Type } from "@talxis/client-libraries";
import { IRecordTree } from "./record-tree/RecordTree";
import { IRecordsDeleteResult, ISourceDataProvider } from "../source-data-provider";
import { ErrorHelper } from "../../../../utils/error-handling";
import { ILocalizationService, ITaskGridLabels } from "../../labels";
import { INativeColumns } from "../../interfaces";
import { DataBuilder } from "@talxis/client-libraries/dist/utils/dataset/data-providers/memory-provider/DataBuilder";

export const REQUIRED_COLUMNS = ['subject', 'parentId', 'stackRank', 'path'];

export interface ITaskDataProviderOptions {
    taskTree: IRecordTree;
    nativeColumns: INativeColumns;
    localizationService: ILocalizationService<ITaskGridLabels>;
    strategy: ITaskDataProviderStrategy;
    onIsFlatListEnabled: () => boolean;
}

export interface ITaskDataProviderStrategy {
    //if empty => all records are fetch
    onGetRawRecords: (ids: string[]) => Promise<IRawRecord[]>;
    onInitialize: (provider: ITaskDataProvider) => Promise<{ columns: IColumn[]; rawData: IRawRecord[]; metadata: any }>
    //columns that can be used in the grid - both native and custom, if supported
    onGetAvailableColumns: (options?: IAvailableColumnOptions) => Promise<IColumn[]>;
    onGetAvailableRelatedColumns: () => Promise<IAvailableRelatedColumn[]>;
    onGetQuickFindColumns: () => string[];
    onCreateTask(parentTaskId?: string): Promise<IRawRecord | null>;
    onDeleteTasks(taskIds: string[]): Promise<IRecordsDeleteResult>;
    onCreateTemplateFromTask(taskId: string): Promise<IRawRecord>;
    onCreateTasksFromTemplate(templateId: string, parentTaskId?: string): Promise<IRawRecord[]>;
    onEditTasks(taskIds: string[]): Promise<IRawRecord[]>;
    onMoveTask(movingTaskId: string, movingToTaskId: string, position: 'above' | 'below' | 'child'): Promise<void>;
    onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult>;
    onIsRecordActive(recordId: string): boolean;
    onOpenDatasetItem(entityReference: ComponentFramework.EntityReference, context?: { columnName?: string }): void;
    onIsTaskAddingEnabled?(): boolean;
    onIsTaskEditingEnabled?(): boolean;
    onIsTaskDeletingEnabled?(): boolean;
    onGetRootTaskId?: () => string | undefined
}

export interface ITaskDataProviderEventListener {
    onBeforeTemplateCreated: (taskId: string) => void;
    onAfterTemplateCreated: (record: IRawRecord) => void;
    onBeforeTasksDeleted: (taskIds: string[]) => void;
    onAfterTasksDeleted: (taskIds: string[]) => void;
    onBeforeTasksCreated: (parentId?: string) => void;
    onAfterTasksCreated: (records: IRecord[], parentId?: string) => void;
    onBeforeTaskMoved: () => void;
    onAfterTaskMoved: (movingFromTaskId: string, movingToTaskId: string, position: 'above' | 'below' | 'child') => void;
    onBeforeTasksEdited: (taskIds: string[]) => void;
    onTaskDataUpdated: (data: IRawRecord[]) => void;
    onAfterTasksEdited: (taskIds: string[]) => void;
    onRecordTreeUpdated: (updatedParentIds: (string | undefined)[]) => void;
    onError: (error: any, message: string) => void;
}

export interface ITaskDataProvider extends IDataProvider {
    taskEvents: IEventEmitter<ITaskDataProviderEventListener>;
    getNativeColumns(): INativeColumns;
    getAllRecords(): IRecord[];
    getStrategy<T extends ITaskDataProviderStrategy>(): T;
    fetchRawRecords(ids: string[]): Promise<IRawRecord[]>;
    getRecordTree(): IRecordTree;
    updateTaskData(newData: IRawRecord[]): void;
    editTasks(taskIds: string[]): Promise<void>;
    bulkEditTasks(taskIds: string[]): Promise<void>;
    createTask(parentTaskId?: string): Promise<void>;
    deleteTasks(taskIds: string[]): Promise<void>;
    createTemplateFromTask(taskId: string): Promise<void>;
    createTasksFromTemplate(templateId: string, parentId?: string): Promise<void>;
    isFlatListEnabled(): boolean;
    isTaskAddingEnabled(): boolean;
    isTaskEditingEnabled(): boolean;
    isTaskDeletingEnabled(): boolean;
    getRootTaskId: () => string | null;
    moveTask(movingTaskId: string, movingToTaskId: string, position: 'above' | 'below' | 'child'): Promise<void>;
}

export class TaskDataProvider extends MemoryDataProvider implements ITaskDataProvider {
    private _nativeColumns: INativeColumns;
    private _localizationService: ILocalizationService<ITaskGridLabels>;
    private _hasDataBeenLoaded: boolean = false;
    private _taskTree: IRecordTree;
    private _strategy: ITaskDataProviderStrategy;
    private _onFlatListEnabled: () => boolean;
    public readonly taskEvents: EventEmitter<ITaskDataProviderEventListener> = new EventEmitter<ITaskDataProviderEventListener>();

    constructor(options: ITaskDataProviderOptions) {
        super({
            dataSource: [],
            metadata: { PrimaryIdAttribute: 'id' }
        })
        this._nativeColumns = options.nativeColumns;
        this._taskTree = options.taskTree;
        this._localizationService = options.localizationService;
        this._strategy = options.strategy;
        this._onFlatListEnabled = options.onIsFlatListEnabled;
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
            record.setRawData(updatedData);
            const newParentId = record.getValue(this.getNativeColumns().parentId)?.[0]?.id?.guid;
            if (originalParentId !== newParentId) {
                recordTreeChanged = true;
                affectedParentIds.push(recordId, originalParentId, newParentId);
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

    public async moveTask(movingFromTaskId: string, movingToTaskId: string, position: "above" | "below" | "child") {
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                this.taskEvents.dispatchEvent('onBeforeTaskMoved');
                await this._strategy.onMoveTask(movingFromTaskId, movingToTaskId, position);
                this._taskTree.build();
                this.taskEvents.dispatchEvent('onAfterTaskMoved', movingFromTaskId, movingToTaskId, position);
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        })
    }

    public async createTask(parentId?: string) {
        this.taskEvents.dispatchEvent('onBeforeTasksCreated', parentId);
        await ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const rawRecord = await this._strategy.onCreateTask(parentId);
                this._createTasks(rawRecord ? [rawRecord] : [], parentId);
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        });
    }

    public async createTasksFromTemplate(templateId: string, parentId?: string) {
        this.taskEvents.dispatchEvent('onBeforeTasksCreated', parentId);
        await ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const rawRecords = await this._strategy.onCreateTasksFromTemplate(templateId, parentId);
                this._createTasks(rawRecords, parentId);
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        })
    }

    public async createTemplateFromTask(taskId: string) {
        this.taskEvents.dispatchEvent('onBeforeTemplateCreated', taskId);
        await ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const rawRecord = await this._strategy.onCreateTemplateFromTask(taskId);
                this.taskEvents.dispatchEvent('onAfterTemplateCreated', rawRecord);
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

    public async deleteTasks(taskIds: string[]): Promise<void> {
        this.taskEvents.dispatchEvent('onBeforeTasksDeleted', taskIds);
        await ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const result = await this._strategy.onDeleteTasks(taskIds);
                const successfulDeletes = result.results.filter(r => r.success).map(r => r.recordId);
                const failedDeletes = result.results.filter(r => !r.success);
                await this.deleteRecords(successfulDeletes);
                this.setSelectedRecordIds(this.getSelectedRecordIds().filter(id => !successfulDeletes.includes(id)));
                this._taskTree.build();
                this.taskEvents.dispatchEvent('onRecordTreeUpdated', successfulDeletes);
                this.taskEvents.dispatchEvent('onAfterTasksDeleted', successfulDeletes);
                if (failedDeletes.length > 0) {
                    const errorMessages: string[] = [];
                    for (const notDeletedResult of failedDeletes) {
                        const taskName = this.getRecordsMap()[notDeletedResult.recordId].getNamedReference().name;
                        errorMessages.push(`${taskName}: ${notDeletedResult.errorMessage ?? ''}`);
                    }
                    throw new Error(errorMessages.join('\n'));
                }
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        })
    }

    public async editTasks(taskIds: string[]) {
        await ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                this.taskEvents.dispatchEvent('onBeforeTasksEdited', taskIds);
                const rawRecords = await this._strategy.onEditTasks(taskIds);
                this.updateTaskData(rawRecords);
                this.taskEvents.dispatchEvent('onAfterTasksEdited', taskIds);
            },
            onError: (error, message) => this.taskEvents.dispatchEvent('onError', error, message)
        })
    }

    public async bulkEditTasks(taskIds: string[]) {
        await ErrorHelper.executeWithErrorHandling({
            operation: async () => {

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
            taskTree: this._taskTree,
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
                position: 'start'
            },);
            const stackRankAttributeName = this.getNativeColumns().stackRank;
            if (record.getValue(stackRankAttributeName) == null) {
                console.warn(`Record with id ${record.getRecordId()} is missing stack rank value. Setting it to 0.`, record);
                record.setValue(stackRankAttributeName, 0);
                const newRawData = record.toRawData()
                record.setRawData(newRawData);
            }
            //@ts-ignore - we need to set task data provider as record provider
            record._dataProvider = this;
            records.push(record);
        }
        if (records.length > 0) {
            this._taskTree.build();
            this.taskEvents.dispatchEvent('onRecordTreeUpdated', [parentId]);
        }
        this.taskEvents.dispatchEvent('onAfterTasksCreated', records, parentId);
    }
}