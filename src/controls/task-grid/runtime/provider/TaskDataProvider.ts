import { EventEmitter, GetDataEvent, IAvailableColumnOptions, IFormatting, IAvailableRelatedColumn, IColumn, IDataProvider, IDataProviderEventListeners, IEventBubbleOptions, IMemoryProviderEntityMetadata, IRawRecord, IRecord, IRecordSaveOperationResult, IRetrievedData, MemoryDataProvider, Operators } from "@talxis/client-libraries";
import { HookRegistry } from "@core";
import { StackRank } from "@core/stack-rank";
import { IRecordTree, RecordTree } from "./record-tree";
import { ITaskDataProviderConfigureParameters, INewTaskParameters, IDeleteTasksResult, IFailedRecord, IFieldMapping, ITaskDeletion, IOpenTasksResult, ITaskChanges, ITaskCreateParameters, ITaskCreateResult, ITasksCreateResult, TaskCreatePosition, ITaskDataProvider, ITaskDataProviderEvents, ITaskMoveParameters, ITaskMovePosition, ITaskStore, TaskAvailableColumnsHook, ITaskColumnHandler, ITaskColumnMatcher, TaskLoadWaiter } from "./interfaces";

export interface ITaskDataProviderParameters {
    store: ITaskStore;
    /** The formatting values are written and read with; the app user's when left out. */
    formatting?: IFormatting;
}

const ACTIVE_STATE_CODE = 0;

type TaskCreationOutcome = { isCreated: boolean } | { error: unknown };

const copyColumn = (column: IColumn): IColumn => ({ ...column, metadata: { ...column.metadata } });

/** Every task of a view, loaded at once through a store and shown as a tree. */
export class TaskDataProvider extends MemoryDataProvider implements ITaskDataProvider {
    private _store: ITaskStore;
    private _fieldMapping?: IFieldMapping;
    private _quickFindColumnNames: string[] = [];
    private _rootTaskId?: string;
    private _defaultCreatePosition: TaskCreatePosition = 'first';
    private _tree: RecordTree;
    private _hasLoaded = false;
    private _newTaskPositions = new Map<string, TaskCreatePosition>();
    private _definitions = new Map<string, IColumn>();
    private _declaredColumns: IColumn[] = [];
    private _availableColumnsHooks = new HookRegistry<TaskAvailableColumnsHook>();
    private _columnHandlers: ITaskColumnHandler[] = [];
    private _columnMatchers: ITaskColumnMatcher[] = [];
    private _requiredColumns: IColumn[] = [];
    private _hoursPerDay?: number;
    private _pendingTasks = new Map<string, Promise<TaskCreationOutcome>>();
    private _failedCreations = new Map<string, TaskCreationOutcome>();
    private _synchronization?: Promise<void>;
    private _queuedSynchronization?: Promise<void>;
    private _loadWaiters: TaskLoadWaiter[] = [];
    //the same array until the tree changes
    private _visibleRecords: IRecord[] = [];
    public readonly taskEvents = new EventEmitter<ITaskDataProviderEvents>();

    constructor(parameters: ITaskDataProviderParameters) {
        super({ dataSource: [], metadata: { PrimaryIdAttribute: 'id' }, formatting: parameters.formatting });
        this._store = parameters.store;
        this._tree = new RecordTree(this, columnName => this._columnMatchers.find(matcher => matcher.isHandledColumn(columnName)));
        this.addEventListener('onRecordColumnValueChanged', this._onRecordColumnValueChanged);
    }

    public configure(parameters: ITaskDataProviderConfigureParameters): void {
        this._fieldMapping = { ...parameters.fieldMapping, stateCode: parameters.fieldMapping.stateCode ?? 'statecode' };
        this._rootTaskId = parameters.rootTaskId;
        this._defaultCreatePosition = parameters.defaultCreatePosition ?? 'first';
        this._hoursPerDay = parameters.hoursPerDay;
    }

    public getFieldMapping(): IFieldMapping {
        if (!this._fieldMapping) {
            throw new Error('The task provider has no field mapping until the task runtime configures it.');
        }
        return this._fieldMapping;
    }

    public getStore(): ITaskStore {
        return this._store;
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
        //builds the provider's own records for the tree
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
        //the base fills its defaults into the columns it is handed
        this._declaredColumns = columns.filter(column => !column.isHidden || !this._isImplicitColumn(column.name)).map(copyColumn);
        const declaredNames = new Set(this._declaredColumns.map(column => column.name));
        const implicitColumns = this._getImplicitColumnNames().filter(name => !declaredNames.has(name)).map(name => ({ ...this._getDefinition(name), isHidden: true }));
        super.setColumns([...this._declaredColumns.map(this._completeColumn), ...implicitColumns]);
    }

    public setQuickFindColumns(columnNames: string[]): void {
        this._quickFindColumnNames = columnNames;
    }

    public areInactiveTasksHidden(): boolean {
        return !!this._getStateCodeCondition();
    }

    public async setInactiveTasksHidden(isHidden: boolean): Promise<void> {
        const filtering = this.getFiltering();
        const conditions = (filtering?.conditions ?? []).filter(condition => condition.attributeName !== this.getFieldMapping().stateCode);
        if (isHidden) {
            conditions.push({ attributeName: this.getFieldMapping().stateCode, conditionOperator: Operators.Equal.Value, value: `${ACTIVE_STATE_CODE}` });
        }
        this.setFiltering({ filterOperator: filtering?.filterOperator ?? 0, filters: filtering?.filters ?? [], conditions });
        await this.refresh();
    }

    public onIsRecordActive(recordId: string): boolean {
        return this.getRecordsMap()[recordId]?.getValue(this.getFieldMapping().stateCode) == ACTIVE_STATE_CODE;
    }

    public async onGetAvailableColumns(options?: IAvailableColumnOptions): Promise<IColumn[]> {
        const columns = await this._store.getAvailableColumns(options);
        if (this._isRelatedEntity(options)) {
            return columns;
        }
        //the hooks add columns of the tasks, such as Path
        return this._withHookColumns(columns).map(this._withHoursPerDay);
    }

    public addAvailableColumnsHook(hook: TaskAvailableColumnsHook, priority?: number): () => void {
        return this._availableColumnsHooks.add(hook, priority);
    }

    public addColumnHandler(handler: ITaskColumnHandler): () => void {
        this._columnHandlers.push(handler);
        return () => this._columnHandlers = this._columnHandlers.filter(registered => registered !== handler);
    }

    public addRequiredColumn(column: IColumn): () => void {
        this._requiredColumns.push(column);
        return () => this._requiredColumns = this._requiredColumns.filter(registered => registered !== column);
    }

    public addColumnMatcher(matcher: ITaskColumnMatcher): () => void {
        this._columnMatchers.push(matcher);
        return () => this._columnMatchers = this._columnMatchers.filter(registered => registered !== matcher);
    }

    public isColumnQueried(columnName: string): boolean {
        const isSorted = this.getSorting().some(sort => sort.name === columnName);
        const isFiltered = this.getFiltering()?.conditions.some(condition => condition.attributeName === columnName) ?? false;
        const isSearched = !!this.getSearchQuery() && this.getQuickFindColumns().some(column => column.name === columnName);
        return isSorted || isFiltered || isSearched;
    }

    public addLoadWaiter(waiter: TaskLoadWaiter): () => void {
        this._loadWaiters.push(waiter);
        return () => this._loadWaiters = this._loadWaiters.filter(registered => registered !== waiter);
    }

    public async onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return this._store.getAvailableRelatedColumns();
    }

    public async onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        //the store dropped the task
        if (!await this.whenTaskCreated(record.getRecordId())) {
            return { recordId: record.getRecordId(), success: true, fields: [] };
        }
        const results: IRecordSaveOperationResult[] = [];
        let hasUnhandledField = false;
        for (const field of record.getFields().filter(field => field.isDirty())) {
            const column = field.getColumn();
            const handler = this._columnHandlers.find(handler => handler.isHandledColumn(column.name));
            if (handler) {
                results.push(await handler.saveValue(record, column, field.getValue()));
            }
            else {
                hasUnhandledField = true;
            }
        }
        if (hasUnhandledField || results.length === 0) {
            results.push(await this._store.saveTask(record));
        }
        if (results.some(result => result.success)) {
            this._scheduleSynchronization();
        }
        return {
            recordId: record.getRecordId(),
            success: results.every(result => result.success),
            fields: results.flatMap(result => result.fields ?? []),
            errors: results.flatMap(result => result.errors ?? []),
        };
    }

    //records open through the task runtime's actions
    public onOpenDatasetItem(): void { }

    //shown at once and filled in from what the store returns
    public createTask(parentId?: string, parameters?: INewTaskParameters): IRecord | null {
        const resolvedParentId = parentId ?? this._rootTaskId;
        if (resolvedParentId && this.isTaskPending(resolvedParentId)) {
            return null;
        }
        const position = parameters?.position ?? this._defaultCreatePosition;
        const params = { ...this._resolveCreate(resolvedParentId, position), data: parameters?.data, taskId: crypto.randomUUID() };
        const fieldMapping = this.getFieldMapping();
        const [record] = this._addTasks([{
            ...params.data,
            [this.getMetadata().PrimaryIdAttribute!]: params.taskId,
            [fieldMapping.parentId]: params.parentRecord ? [params.parentRecord.getNamedReference()] : null,
            [fieldMapping.stackRank]: params.stackRank,
            [fieldMapping.stateCode]: ACTIVE_STATE_CODE,
        }], resolvedParentId, position);
        this._pendingTasks.set(params.taskId, this._finishPendingTask(params));
        return record;
    }

    public async createTasksWith(parentId: string | undefined, create: (parameters: ITaskCreateParameters) => Promise<ITasksCreateResult | null>, options?: { position?: TaskCreatePosition }): Promise<IRecord[] | null> {
        const resolvedParentId = parentId ?? this._rootTaskId;
        const position = options?.position ?? this._defaultCreatePosition;
        const result = await create(this._resolveCreate(resolvedParentId, position));
        if (!result) {
            return null;
        }
        const records = this._addTasks(result.records, resolvedParentId, position);
        this._scheduleSynchronization();
        return records;
    }

    public isTaskPending(taskId: string): boolean {
        return this._pendingTasks.has(taskId);
    }

    public async whenTaskCreated(taskId: string): Promise<boolean> {
        const outcome = await this._pendingTasks.get(taskId) ?? this._failedCreations.get(taskId) ?? { isCreated: true };
        if ('error' in outcome) {
            throw outcome.error;
        }
        return outcome.isCreated;
    }

    public getNewTaskPosition(taskId: string): TaskCreatePosition | undefined {
        return this._newTaskPositions.get(taskId);
    }

    public getDeletion(taskIds: string[]): ITaskDeletion {
        const { structure } = this._tree;
        const candidateIds = new Set(taskIds.flatMap(taskId => [taskId, ...structure.getDescendants(taskId).map(record => record.getRecordId())]));
        const refusedTaskIds = [...candidateIds].filter(taskId => this.isTaskPending(taskId) || this._store.canDeleteTask?.(this.getRecordsMap()[taskId]) === false);
        const keptIds = new Set(refusedTaskIds.flatMap(taskId => structure.getAncestorIds(taskId)));
        return { deletableTaskIds: [...candidateIds].filter(taskId => !keptIds.has(taskId)), refusedTaskIds };
    }

    public async deleteTasks(taskIds: string[]): Promise<IDeleteTasksResult | null> {
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
            const result = await this._store.deleteTasks({ taskIds: levelIds, tree: this._tree });
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
            this._scheduleSynchronization();
        }
        return errors.length === 0 ? { success: true, deletedTaskIds } : { success: false, deletedTaskIds, errors };
    }

    public moveTask(movingTaskId: string, targetTaskId: string, position: ITaskMovePosition): IRecord | null {
        const params = this._resolveMove(movingTaskId, targetTaskId, position);
        if (!params) {
            return null;
        }
        const { parentId, stackRank } = this.getFieldMapping();
        params.movingRecord.setValue(parentId, params.parentRecord ? [params.parentRecord.getNamedReference()] : null);
        params.movingRecord.setValue(stackRank, params.stackRank);
        this.taskEvents.dispatchEvent('onTaskMoved', params);
        return params.movingRecord;
    }

    public async openTasks(taskIds: string[]): Promise<IOpenTasksResult | null> {
        await Promise.all(taskIds.map(taskId => this.whenTaskCreated(taskId)));
        const result = await this._store.openTasks(taskIds);
        if (result) {
            //listeners read what the editor saved from the tasks' data
            await this.synchronize();
            this.taskEvents.dispatchEvent('onEditorClosed', taskIds);
        }
        return result;
    }

    public async openRelatedRecord(reference: ComponentFramework.EntityReference, columnName: string): Promise<void> {
        await this._store.openRelatedRecord(reference, columnName);
    }

    public synchronize(): Promise<void> {
        if (!this._store.synchronize) {
            return Promise.resolve();
        }
        this._queuedSynchronization ??= this._runSynchronization(this._synchronization);
        return this._queuedSynchronization;
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
            this._mergeRawData(record, rawRecord);
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

    //a copy of the loaded tasks for export and totals
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
        //a new task keeps its place only until the view is loaded again
        if (event === 'onBeforeNewDataLoaded') {
            this._newTaskPositions.clear();
        }
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
        const primaryIdAttribute = this.getMetadata().PrimaryIdAttribute!;
        const taskIds = this.getDataSource().map(rawRecord => rawRecord[primaryIdAttribute]);
        await Promise.all(this._loadWaiters.map(waiter => waiter({ taskIds })));
        return this.getDataSync(pageNumber, pageSize, previousPageNumber, event);
    }

    //the tree sorts and filters every record
    public getDataSync(_pageNumber: number, _pageSize: number, _previousPageNumber: number, _event: GetDataEvent): IRetrievedData {
        return { data: this.getDataSource(), hasNextPage: false, totalRecordCount: this.getDataSource().length };
    }

    public destroy(): void {
        super.destroy();
        this.taskEvents.clearEventListeners();
    }

    private async _load(): Promise<void> {
        const { rawData, metadata, columns } = await this._store.load(this);
        //the handlers read which entity the tasks are
        this.setMetadata(metadata);
        this.setEntityName(metadata.LogicalName ?? '');
        await this._loadHandledValues(rawData, metadata.PrimaryIdAttribute!);
        //the loaded columns only fill in what the available ones do not know
        this._definitions = new Map([...columns, ...await this.onGetAvailableColumns()].map(column => [column.name, column]));
        this.setDataSource(rawData);
        //the base fills data-type defaults into what getColumns returns
        this.setColumns(this._declaredColumns.length > 0 ? this._declaredColumns : columns);
        this._hasLoaded = true;
    }

    //later task updates keep what is merged here
    private async _loadHandledValues(rawData: IRawRecord[], primaryIdAttribute: string): Promise<void> {
        const taskIds = rawData.map(rawRecord => rawRecord[primaryIdAttribute]);
        const valueMaps = await Promise.all(this._columnHandlers.map(handler => handler.loadValues?.(taskIds) ?? new Map<string, IRawRecord>()));
        for (const rawRecord of rawData) {
            for (const values of valueMaps) {
                Object.assign(rawRecord, values.get(rawRecord[primaryIdAttribute]));
            }
        }
    }

    //a store may return fewer columns than were loaded
    private _mergeRawData(record: IRecord, rawData: IRawRecord): void {
        //puts the user's unsaved edits back over the rebuilt fields
        const edits = record.getFields().filter(field => field.isDirty()).map(field => [field.getColumn().name, field.getValue()] as const);
        const editedNames = new Set(edits.map(([columnName]) => columnName));
        const loaded = Object.fromEntries(Object.entries(rawData).filter(([columnName]) => !editedNames.has(columnName)));
        record.setRawData({ ...record.getRawData(), ...loaded });
        edits.forEach(([columnName, value]) => record.setValue(columnName, value));
    }

    private _applyChanges(changes?: ITaskChanges): void {
        if (changes && changes.updatedRecords.length > 0) {
            this.updateTaskData(changes.updatedRecords);
        }
    }

    //writes share the queued read until it starts
    private async _runSynchronization(previous?: Promise<void>): Promise<void> {
        try {
            await previous;
        }
        catch { }
        //a macrotask lets a save mark its values saved before the merge
        await new Promise(resolve => setTimeout(resolve));
        const run = this._queuedSynchronization;
        this._queuedSynchronization = undefined;
        this._synchronization = run;
        try {
            this._applyChanges(await this._store.synchronize?.());
        }
        finally {
            if (this._synchronization === run) {
                this._synchronization = undefined;
            }
        }
    }

    private async _scheduleSynchronization(): Promise<void> {
        try {
            await this.synchronize();
        }
        catch { }
    }

    private _isRelatedEntity(options?: IAvailableColumnOptions): boolean {
        return !!options?.entityName && options.entityName !== this.getEntityName();
    }

    private _withHookColumns(columns: IColumn[]): IColumn[] {
        const result = [...columns];
        this._availableColumnsHooks.apply(result);
        return result;
    }

    //a move, a discarded move and a failed save all come through here
    private _onRecordColumnValueChanged = (_record: IRecord, columnName: string): void => {
        const { parentId, stackRank } = this.getFieldMapping();
        if (columnName === parentId || columnName === stackRank) {
            this._rebuildTree();
        }
    };

    private async _finishPendingTask(params: ITaskCreateParameters & { taskId: string }): Promise<TaskCreationOutcome> {
        let result: ITaskCreateResult | null;
        try {
            result = await this._store.createTask(params);
        }
        catch (error) {
            return this._removePendingTask(params.taskId, { error });
        }
        if (!result) {
            return this._removePendingTask(params.taskId, { isCreated: false });
        }
        //no longer pending before the merge redraws the row
        this._pendingTasks.delete(params.taskId);
        this._applyChanges({ updatedRecords: [result.record] });
        this._scheduleSynchronization();
        return { isCreated: true };
    }

    private async _removePendingTask(taskId: string, outcome: TaskCreationOutcome): Promise<TaskCreationOutcome> {
        this._failedCreations.set(taskId, outcome);
        this._pendingTasks.delete(taskId);
        await this.deleteRecords([taskId]);
        this._rebuildTree();
        this.taskEvents.dispatchEvent('onTasksDeleted', [taskId]);
        return outcome;
    }

    private _addTasks(rawRecords: IRawRecord[], parentId: string | undefined, position: TaskCreatePosition): IRecord[] {
        const primaryIdAttribute = this.getMetadata().PrimaryIdAttribute!;
        const records = rawRecords.map(rawData => this.newRecord({ rawData, recordId: rawData[primaryIdAttribute] }));
        if (records.length > 0) {
            records.forEach(record => this._newTaskPositions.set(record.getRecordId(), position));
            this._rebuildTree();
            this.taskEvents.dispatchEvent('onTasksCreated', records, parentId);
        }
        return records;
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

    //a required column, or one the available columns leave out
    private _completeColumn = (column: IColumn): IColumn => {
        if (column.dataType && !this._getRequiredColumn(column.name)) {
            return column;
        }
        return this._merge(this._getDefinition(column.name), column);
    };

    //a module's required column says more, such as that it stays hidden
    private _getDefinition(columnName: string): IColumn {
        const definition = this._definitions.get(columnName);
        const required = this._getRequiredColumn(columnName);
        if (definition && required) {
            return this._merge(definition, required);
        }
        return required ?? definition ?? { name: columnName, displayName: columnName, dataType: 'SingleLine.Text', order: -1, visualSizeFactor: 100 };
    }

    private _getRequiredColumn(columnName: string): IColumn | undefined {
        return this._requiredColumns.find(column => column.name === columnName);
    }

    private _merge(column: IColumn, over: IColumn): IColumn {
        return { ...column, ...over, metadata: { ...column.metadata, ...over.metadata } };
    }

    //the tree and the modules read these whatever the view shows
    private _getImplicitColumnNames(): string[] {
        const mappedNames = Object.values(this.getFieldMapping()).filter((columnName): columnName is string => !!columnName);
        return [...new Set([...mappedNames, ...this._requiredColumns.map(column => column.name)])];
    }

    private _isImplicitColumn(columnName: string): boolean {
        return this._getImplicitColumnNames().includes(columnName);
    }

    private _withHoursPerDay = (column: IColumn): IColumn => {
        if (this._hoursPerDay === undefined || column.name !== this._fieldMapping?.duration) {
            return column;
        }
        return { ...column, metadata: { HoursPerDay: this._hoursPerDay, ...column.metadata } };
    };

    private _getStateCodeCondition() {
        return this.getFiltering()?.conditions.find(condition => condition.attributeName === this.getFieldMapping().stateCode
            && condition.conditionOperator === Operators.Equal.Value && condition.value === `${ACTIVE_STATE_CODE}`);
    }

    private _resolveCreate(parentId: string | undefined, position: TaskCreatePosition): ITaskCreateParameters {
        const siblings = this._tree.structure.getChildren(parentId ?? null);
        const { stackRank } = this.getFieldMapping();
        return {
            parentRecord: parentId ? this.getRecordsMap()[parentId] : undefined,
            stackRank: position === 'first'
                ? StackRank.between(undefined, siblings[0]?.getValue(stackRank))
                : StackRank.between(siblings[siblings.length - 1]?.getValue(stackRank), undefined),
        };
    }

    //a task cannot land in its own subtree or onto itself
    private _resolveMove(movingTaskId: string, targetTaskId: string, position: ITaskMovePosition): ITaskMoveParameters | null {
        const recordsMap = this.getRecordsMap();
        const movingRecord = recordsMap[movingTaskId];
        const targetRecord = recordsMap[targetTaskId];
        const structure = this._tree.structure;
        if (!movingRecord || !targetRecord || structure.getAncestorIds(targetTaskId).includes(movingTaskId)) {
            return null;
        }
        if (this.isTaskPending(movingTaskId) || (position === 'child' && this.isTaskPending(targetTaskId))) {
            return null;
        }
        const parentId = position === 'child' ? targetTaskId : structure.getParent(targetTaskId)?.getRecordId() ?? null;
        const siblings = structure.getChildren(parentId).filter(record => record.getRecordId() !== movingTaskId);
        const neighbours = structure.getNeighbours(targetTaskId, { exclude: movingTaskId });
        const [previousSibling, nextSibling] = position === 'child'
            ? [undefined, siblings[0]]
            : position === 'above' ? [neighbours.previous, targetRecord] : [targetRecord, neighbours.next];
        const { stackRank } = this.getFieldMapping();
        return {
            movingRecord,
            targetRecord,
            position,
            parentRecord: parentId ? recordsMap[parentId] : undefined,
            stackRank: StackRank.between(previousSibling?.getValue(stackRank), nextSibling?.getValue(stackRank)),
        };
    }

    private _getLevelsDeepestFirst(taskIds: string[]): string[][] {
        const levels: string[][] = [];
        for (const taskId of taskIds) {
            (levels[this._tree.structure.getAncestorIds(taskId).length] ??= []).push(taskId);
        }
        return levels.filter(Boolean).reverse();
    }
}
