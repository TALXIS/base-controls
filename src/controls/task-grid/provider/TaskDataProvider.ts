import { EventEmitter, GetDataEvent, IAvailableRelatedColumn, IColumn, IDataProvider, IDataProviderEventListeners, IEventBubbleOptions, IMemoryProviderEntityMetadata, IRawRecord, IRecord, IRecordSaveOperationResult, IRetrievedData, MemoryDataProvider, Operators } from "@talxis/client-libraries";
import { ErrorHelper } from "@utils/error-handling";
import { IRecordTree, RecordTree } from "./record-tree";
import { mergeColumn } from "./mergeColumn";
import { ITaskDataProviderInitializeParameters, ICreateTaskOptions, IDeleteTasksResult, IFailedRecord, IFieldMapping, ITaskDeletion, IOpenTasksResult, ITaskCreateParams, ITaskDataProvider, ITaskDataProviderEvents, ITaskMoveParams, ITaskMovePosition, ITaskStrategy } from "./interfaces";

export interface ITaskDataProviderParameters {
    strategy: ITaskStrategy;
}

const ACTIVE_STATE_CODE = 0;

/** Every task of a view, loaded at once through a strategy and shown as a tree. */
export class TaskDataProvider extends MemoryDataProvider implements ITaskDataProvider {
    private _strategy: ITaskStrategy;
    private _fieldMapping?: IFieldMapping;
    private _quickFindColumnNames: string[] = [];
    private _rootTaskId?: string;
    private _tree: RecordTree;
    private _hasLoaded = false;
    private _newTaskIds = new Set<string>();
    private _columnCatalogue = new Map<string, IColumn>();
    //the grid reads this on every refresh, so it stays the same array until the tree changes
    private _visibleRecords: IRecord[] = [];
    public readonly taskEvents = new EventEmitter<ITaskDataProviderEvents>();

    constructor(parameters: ITaskDataProviderParameters) {
        super({ dataSource: [], metadata: { PrimaryIdAttribute: 'id' } });
        this._strategy = parameters.strategy;
        this._tree = new RecordTree(this);
    }

    public initialize(parameters: ITaskDataProviderInitializeParameters): void {
        this._fieldMapping = parameters.fieldMapping;
        this._rootTaskId = parameters.rootTaskId;
    }

    public getFieldMapping(): IFieldMapping {
        if (!this._fieldMapping) {
            throw new Error('The task provider has no field mapping until the task runtime initializes it.');
        }
        return this._fieldMapping;
    }

    public getStrategy(): ITaskStrategy {
        return this._strategy;
    }

    public getRecordTree(): IRecordTree {
        return this._tree;
    }

    public getRootTaskId(): string | undefined {
        return this._rootTaskId;
    }

    public getAllRecords(): IRecord[] {
        return super.getRecords();
    }

    public getRecords(): IRecord[] {
        //builds the provider's own records, which the tree is made from
        super.getRecords();
        return this._tree?.isBuilt() ? this._visibleRecords : [];
    }

    public getSortedRecordIds(): string[] {
        return this._tree.view.getOrderedIds();
    }

    public getQuickFindColumns(): IColumn[] {
        const columnNames = this._quickFindColumnNames.length > 0 ? this._quickFindColumnNames : [this.getFieldMapping().subject];
        return columnNames.map(columnName => this.getColumnsMap()[columnName]).filter((column): column is IColumn => !!column);
    }

    public getPaging() {
        //the base constructor asks before the tree exists
        if (!this._tree) {
            return super.getPaging();
        }
        const count = this._tree.view.getCount();
        return { ...super.getPaging(), pageSize: count, totalResultCount: count, hasNextPage: false, setPageSize: () => { } };
    }

    public setColumns(columns: IColumn[]): void {
        super.setColumns(this._withMappedColumns(columns));
    }

    public setQuickFindColumns(columnNames: string[]): void {
        this._quickFindColumnNames = columnNames;
    }

    public areInactiveTasksHidden(): boolean {
        return !!this._getStateCodeCondition();
    }

    public setInactiveTasksHidden(isHidden: boolean): void {
        const filtering = this.getFiltering();
        const conditions = (filtering?.conditions ?? []).filter(condition => condition.attributeName !== this.getFieldMapping().stateCode);
        if (isHidden) {
            conditions.push({ attributeName: this.getFieldMapping().stateCode, conditionOperator: Operators.Equal.Value, value: `${ACTIVE_STATE_CODE}` });
        }
        this.setFiltering({ filterOperator: filtering?.filterOperator ?? 0, filters: filtering?.filters ?? [], conditions });
        this.refresh();
    }

    public isRecordActive(recordId: string): boolean {
        return this.onIsRecordActive(recordId);
    }

    public onIsRecordActive(recordId: string): boolean {
        return this.getRecordsMap()[recordId]?.getValue(this.getFieldMapping().stateCode) == ACTIVE_STATE_CODE;
    }

    public async onGetAvailableColumns(): Promise<IColumn[]> {
        return this._strategy.onGetAvailableColumns();
    }

    public async onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return this._strategy.onGetAvailableRelatedColumns();
    }

    public onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        return this._strategy.onSaveRecord(record);
    }

    public async onOpenDatasetItem(entityReference: ComponentFramework.EntityReference, context?: { columnName?: string }): Promise<void> {
        const isTask = !context?.columnName || context.columnName === this.getFieldMapping().subject;
        await this._open([entityReference], isTask);
    }

    public async createTask(parentId?: string, options?: ICreateTaskOptions): Promise<IRecord | null> {
        return this._execute(async () => {
            const resolvedParentId = parentId ?? this._rootTaskId;
            const rawRecord = await this._strategy.onCreateTask(this._resolveCreate(resolvedParentId, options));
            return rawRecord ? this.addTasks([rawRecord], resolvedParentId)[0] : null;
        });
    }

    public addTasks(rawRecords: IRawRecord[], parentId?: string): IRecord[] {
        const primaryIdAttribute = this.getMetadata().PrimaryIdAttribute!;
        const records = rawRecords.map(rawData => this.newRecord({ rawData, recordId: rawData[primaryIdAttribute] }));
        records.forEach(record => this._newTaskIds.add(record.getRecordId()));
        if (records.length > 0) {
            this._rebuildTree();
            this.taskEvents.dispatchEvent('onTasksCreated', records, parentId);
        }
        return records;
    }

    public isNewTask(taskId: string): boolean {
        return this._newTaskIds.has(taskId);
    }

    public getDeletion(taskIds: string[]): ITaskDeletion {
        const { structure } = this._tree;
        const candidateIds = new Set(taskIds.flatMap(taskId => [taskId, ...structure.getDescendants(taskId).map(record => record.getRecordId())]));
        const refusedTaskIds = [...candidateIds].filter(taskId => this._strategy.onCanDeleteTask?.(this.getRecordsMap()[taskId]) === false);
        const keptIds = new Set(refusedTaskIds.flatMap(taskId => structure.getAncestorIds(taskId)));
        return { deletableTaskIds: [...candidateIds].filter(taskId => !keptIds.has(taskId)), refusedTaskIds };
    }

    public async deleteTasks(taskIds: string[]): Promise<IDeleteTasksResult | null> {
        return this._execute(async () => {
            const { structure } = this._tree;
            const keptIds = new Set<string>();
            const deletedTaskIds: string[] = [];
            const errors: IFailedRecord[] = [];
            for (const level of this._getLevelsDeepestFirst(this.getDeletion(taskIds).deletableTaskIds)) {
                const levelIds = level.filter(taskId => !structure.getChildren(taskId).some(child => keptIds.has(child.getRecordId())));
                level.filter(taskId => !levelIds.includes(taskId)).forEach(taskId => keptIds.add(taskId));
                if (levelIds.length === 0) {
                    continue;
                }
                const result = await this._strategy.onDeleteTasks({ taskIds: levelIds, tree: this._tree });
                if (!result) {
                    break;
                }
                deletedTaskIds.push(...result.deletedTaskIds);
                levelIds.filter(taskId => !result.deletedTaskIds.includes(taskId)).forEach(taskId => keptIds.add(taskId));
                if (!result.success) {
                    errors.push(...result.errors);
                }
            }
            if (deletedTaskIds.length === 0 && errors.length === 0) {
                return null;
            }
            if (deletedTaskIds.length > 0) {
                const deletedIds = new Set(deletedTaskIds);
                await this.deleteRecords(deletedTaskIds);
                this._rebuildTree();
                this.setSelectedRecordIds(this.getSelectedRecordIds().filter(id => !deletedIds.has(id)));
                this.taskEvents.dispatchEvent('onTasksDeleted', deletedTaskIds);
            }
            return errors.length === 0 ? { success: true, deletedTaskIds } : { success: false, deletedTaskIds, errors };
        });
    }

    public async moveTask(movingTaskId: string, targetTaskId: string, position: ITaskMovePosition): Promise<boolean> {
        return this._execute(async () => {
            const params = this._resolveMove(movingTaskId, targetTaskId, position);
            if (!params) {
                return false;
            }
            const result = await this._strategy.onMoveTask(params);
            if (!result) {
                return false;
            }
            this.updateTaskData(result);
            this.taskEvents.dispatchEvent('onTaskMoved', params);
            return true;
        });
    }

    public async openTasks(taskIds: string[]): Promise<IOpenTasksResult | null> {
        const references = taskIds.map(taskId => this.getRecordsMap()[taskId]?.getNamedReference()).filter((reference): reference is ComponentFramework.EntityReference => !!reference);
        return this._open(references, true);
    }

    public updateTaskData(rawRecords: IRawRecord[]): void {
        const primaryIdAttribute = this.getMetadata().PrimaryIdAttribute!;
        const { parentId, stackRank } = this.getFieldMapping();
        const records: IRecord[] = [];
        let isTreeChanged = false;
        for (const rawRecord of rawRecords) {
            const record = this.getRecordsMap()[rawRecord[primaryIdAttribute]];
            if (!record) {
                continue;
            }
            const previousParentId = record.getValue(parentId)?.[0]?.id?.guid;
            const previousStackRank = record.getValue(stackRank);
            //a strategy may return fewer columns than were loaded, such as no linked-entity values
            record.setRawData({ ...record.getRawData(), ...rawRecord });
            isTreeChanged ||= previousParentId !== record.getValue(parentId)?.[0]?.id?.guid || previousStackRank !== record.getValue(stackRank);
            records.push(record);
        }
        if (isTreeChanged) {
            this._rebuildTree();
        }
        this.taskEvents.dispatchEvent('onTasksUpdated', records);
    }

    //a workaround for the memory provider indexing a created record at the slot before it
    public onRecordCreate(record: IRecord, options?: { position: 'start' | 'end' }): void {
        super.onRecordCreate(record, options);
        this.setDataSource(this.getDataSource());
    }

    //export and totals read a copy of the loaded tasks; loading them again would rerun the strategy
    public createNewDataProvider(_eventBubbleOptions?: IEventBubbleOptions): IDataProvider {
        return new MemoryDataProvider({
            dataSource: this.getDataSource(),
            metadata: this.getMetadata() as IMemoryProviderEntityMetadata,
            columns: this.getColumns(),
            sorting: this.getSorting(),
            filtering: this.getFiltering() ?? undefined,
            searchQuery: this.getSearchQuery(),
        });
    }

    public dispatchEvent<K extends keyof IDataProviderEventListeners>(event: K, ...args: Parameters<IDataProviderEventListeners[K]>): boolean {
        if (event === 'onNewDataLoaded' && this._tree) {
            this._tree.build();
            this._visibleRecords = this._getVisibleRecords();
        }
        return super.dispatchEvent(event, ...args);
    }

    public async getDataAsync(pageNumber: number, pageSize: number, previousPageNumber: number, event: GetDataEvent): Promise<IRetrievedData> {
        if (!this._hasLoaded) {
            await this._load();
        }
        return this.getDataSync(pageNumber, pageSize, previousPageNumber, event);
    }

    //the tree sorts and filters, so every record is handed over
    public getDataSync(_pageNumber: number, _pageSize: number, _previousPageNumber: number, _event: GetDataEvent): IRetrievedData {
        return { data: this.getDataSource(), hasNextPage: false, totalRecordCount: this.getDataSource().length };
    }

    public destroy(): void {
        super.destroy();
        this.taskEvents.clearEventListeners();
    }

    private async _load(): Promise<void> {
        const { rawData, metadata, columns } = await this._strategy.onLoad(this);
        this._columnCatalogue = new Map(columns.map(column => [column.name, column]));
        this.setMetadata(metadata);
        this.setEntityName(metadata.LogicalName ?? '');
        this.setDataSource(rawData);
        //what was set before the load may have lacked definitions the catalogue now has
        const currentColumns = this.getColumns().filter(column => !column.isHidden || !this._isMappedColumn(column.name)).map(column => this._withDefinition(column));
        this.setColumns(currentColumns.length > 0 ? currentColumns : columns);
        this._hasLoaded = true;
    }

    private _rebuildTree(): void {
        this._tree.build();
        this._visibleRecords = this._getVisibleRecords();
        this.taskEvents.dispatchEvent('onTreeChanged');
    }

    private _getVisibleRecords(): IRecord[] {
        const recordsMap = this.getRecordsMap();
        return this._tree.view.getOrderedIds().map(recordId => recordsMap[recordId]).filter((record): record is IRecord => !!record);
    }

    private _withDefinition(column: IColumn): IColumn {
        const definition = this._columnCatalogue.get(column.name);
        return definition ? mergeColumn(definition, column) : column;
    }

    private _isMappedColumn(columnName: string): boolean {
        return Object.values(this.getFieldMapping()).includes(columnName);
    }

    //the tree reads these whatever the view shows
    private _withMappedColumns(columns: IColumn[]): IColumn[] {
        const columnNames = new Set(columns.map(column => column.name));
        const missing = Object.values(this.getFieldMapping())
            .filter((columnName): columnName is string => !!columnName && !columnNames.has(columnName))
            .map((columnName): IColumn => ({
                ...(this._columnCatalogue.get(columnName) ?? { name: columnName, displayName: columnName, dataType: 'SingleLine.Text', order: -1, visualSizeFactor: 100 }),
                isHidden: true,
            }));
        return [...columns, ...missing];
    }

    private _getStateCodeCondition() {
        return this.getFiltering()?.conditions.find(condition => condition.attributeName === this.getFieldMapping().stateCode
            && condition.conditionOperator === Operators.Equal.Value && condition.value === `${ACTIVE_STATE_CODE}`);
    }

    private async _open(references: ComponentFramework.EntityReference[], isTask: boolean): Promise<IOpenTasksResult | null> {
        return this._execute(async () => {
            const result = await this._strategy.onOpenRecords(references, isTask);
            if (result) {
                this.updateTaskData(result.updatedRecords);
            }
            return result;
        });
    }

    private _resolveCreate(parentId?: string, options?: ICreateTaskOptions): ITaskCreateParams {
        const { structure } = this._tree;
        const siblings = structure.getChildren(parentId ?? null);
        const recordsMap = this.getRecordsMap();
        const previousTaskId = options?.previousTaskId;
        const nextTaskId = options?.nextTaskId;
        return {
            parentRecord: parentId ? recordsMap[parentId] : undefined,
            siblings,
            previousSibling: previousTaskId ? recordsMap[previousTaskId] : nextTaskId ? structure.getNeighbours(nextTaskId).previous : undefined,
            nextSibling: nextTaskId ? recordsMap[nextTaskId] : previousTaskId ? structure.getNeighbours(previousTaskId).next : siblings[0],
            data: options?.data,
            fieldMapping: this.getFieldMapping(),
            columns: this.getColumns(),
            metadata: this.getMetadata(),
        };
    }

    //a task cannot land in its own subtree, which also covers dropping it onto itself
    private _resolveMove(movingTaskId: string, targetTaskId: string, position: ITaskMovePosition): ITaskMoveParams | null {
        const recordsMap = this.getRecordsMap();
        const movingRecord = recordsMap[movingTaskId];
        const targetRecord = recordsMap[targetTaskId];
        const structure = this._tree.structure;
        if (!movingRecord || !targetRecord || structure.getAncestorIds(targetTaskId).includes(movingTaskId)) {
            return null;
        }
        const parentId = position === 'child' ? targetTaskId : structure.getParent(targetTaskId)?.getRecordId() ?? null;
        const siblings = structure.getChildren(parentId).filter(record => record.getRecordId() !== movingTaskId);
        const neighbours = structure.getNeighbours(targetTaskId, { exclude: movingTaskId });
        const [previousSibling, nextSibling] = position === 'child'
            ? [undefined, siblings[0]]
            : position === 'above' ? [neighbours.previous, targetRecord] : [targetRecord, neighbours.next];
        return {
            movingRecord,
            targetRecord,
            position,
            parentRecord: parentId ? recordsMap[parentId] : undefined,
            siblings,
            previousSibling,
            nextSibling,
            fieldMapping: this.getFieldMapping(),
        };
    }

    private _getLevelsDeepestFirst(taskIds: string[]): string[][] {
        const levels: string[][] = [];
        for (const taskId of taskIds) {
            (levels[this._tree.structure.getAncestorIds(taskId).length] ??= []).push(taskId);
        }
        return levels.filter(Boolean).reverse();
    }

    private _execute<T>(operation: () => Promise<T>): Promise<T> {
        return ErrorHelper.executeWithErrorHandling({ operation, onError: (error, message) => this.dispatchEvent('onError', message, error) });
    }
}
