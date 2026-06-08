import { IRecord, IFetchXmlDataProvider, IRawRecord, FetchXmlDataProvider, FetchXmlBuilder, IAvailableColumnOptions, IAvailableRelatedColumn, IRecordSaveOperationResult, IColumn, Sanitizer, Operators, DataTypes, ISingleRecord, DatasetConstants } from "@talxis/client-libraries";
import { ITaskDataProviderStrategy, ITaskDataProvider, IDeleteTasksResult, IOpenDatasetItemsResult, ICustomColumnsDataProvider } from "../../providers";
import { IRecordTree } from "../../providers/task/record-tree";
import { LexoRank } from "lexorank";
import { Liquid } from "liquidjs";
import { IFieldMapping } from "./DataverseTaskGridDescriptor";
import { LookupManyHandler } from "./lookup-many/LookupManyHandler";
import { ITaskStrategyDeps } from "../..";
import { IDataverseCustomColumnsStrategy } from "./DataverseCustomColumnsStrategy";


interface IFormParameters {
    pageInput: Xrm.Navigation.PageInputEntityRecord;
    navigationOptions: Xrm.Navigation.NavigationOptions;
}

/** Constructor parameters for {@link DataverseTaskStrategy}. */
export interface IDataverseTaskStrategyParams {
    /** FetchXML used to load tasks. May contain Liquid template variables (e.g. `{{ projectId }}`). */
    fetchXml: string;
    /** When `false`, the edit form is opened in read-only mode. Defaults to `true`. */
    isEditingEnabled?: boolean;
    /** When `true`, deleting a task will also delete its child tasks. Defaults to `false`. */
    isCascadeDeleteEnabled?: boolean;
    /** When `true`, deleting tasks with children is enabled. Defaults to `false`. */
    isDeletingTasksWithChildrenEnabled?: boolean;
    /** Form ID to open when editing a single existing task. */
    editFormId?: string;
    /** Form ID to open when creating a new task via dialog (non-inline). */
    createFormId?: string;
    /** Form ID to open when bulk-editing multiple selected tasks. */
    bulkEditFormId?: string;
    /** Project record reference. When provided, new tasks are pre-linked to this project. */
    projectRecord?: ISingleRecord;

    sourceRecord?: ISingleRecord;
    /** When set, the task hierarchy is rooted at this task ID. */
    rootTaskId?: string;
    /**
     * Optional hook to intercept and override the `Xrm.Navigation.navigateTo` parameters for
     * any form operation (`create`, `edit`, `bulkEdit`, `open`).
     * Return the modified `pageInput` and `navigationOptions` to customize the dialog.
     */
    form?: {
        onGetFormParameters?: (operation: 'create' | 'edit' | 'bulkEdit' | 'open', defaultParameters: IFormParameters) => IFormParameters;
    }
}

interface ILookupManyColumn extends IColumn {
    metadata: ILookupManyColumnMetadata;
}

interface ILookupManyColumnMetadata {
    LookupMany: {
        ReferencedEntityNavigationPropertyName: string;
        Select?: string;
        CustomIntersection?: {
            ReferencingEntityNavigationPropertyName: string;
        }
    }
}

/** Extends {@link ITaskDataProviderStrategy} with a Dataverse-specific accessor for the project reference. */
export interface IDataverseTaskStrategy extends ITaskDataProviderStrategy {
    /** Returns the resolved project entity reference, or `null` if no project was provided at construction time. */
    getProjectRecord(): ISingleRecord | null;
    getSourceRecord(): ISingleRecord | null;
}

const LIQUID = new Liquid();

/**
 * Ready-to-use {@link ITaskDataProviderStrategy} implementation for the Dataverse / Talxis platform.
 *
 * Handles all task CRUD operations, drag-and-drop reordering (via LexoRank), template-based creation,
 * and lookup-many column rendering — all backed by the Xrm WebApi and FetchXML.
 *
 * Normally instantiated automatically by {@link DataverseTaskGridDescriptor}. Construct directly only
 * when you need to pass a custom `form` strategy or override specific behaviour.
 */
export class DataverseTaskStrategy implements IDataverseTaskStrategy {
    private _fetchXml: string;
    private _entitySetName!: string;
    private _entityName!: string;
    private _projectReference?: ComponentFramework.EntityReference;
    private _projectRecord?: ISingleRecord;
    private _projectMetadata?: Xrm.Metadata.EntityMetadata;
    private _rootTaskId?: string;
    private _taskTree!: IRecordTree;
    private _provider!: ITaskDataProvider;
    private _editFormId?: string;
    private _createFormId?: string;
    private _bulkEditFormId?: string;
    private _fetchXmlDataProvider!: IFetchXmlDataProvider;
    private _isInlineCreateEnabled: boolean;
    private _isEditingEnabled: boolean;
    private _isDeletingTasksWithChildrenEnabled: boolean;
    private _isCascadeDeleteEnabled: boolean;
    private _lookupManyColumns: ILookupManyColumn[] = [];
    private _customColumns: IColumn[] = [];
    private _sourceRecord?: ISingleRecord;
    private _customColumnsDataProvider?: ICustomColumnsDataProvider;
    private _lookupManyHandlers: { [colName: string]: LookupManyHandler } = {};
    private _getFormParameters: (operation: 'create' | 'edit' | 'bulkEdit' | 'open', defaultParameters: IFormParameters) => IFormParameters;


    /** @param params — see {@link IDataverseTaskStrategyParams} for full documentation of each option. */
    constructor(params: IDataverseTaskStrategyParams, deps: ITaskStrategyDeps) {
        this._fetchXml = params.fetchXml;
        this._customColumnsDataProvider = deps.customColumnsDataProvider;
        this._projectRecord = params.projectRecord;
        this._projectReference = this._projectRecord?.getNamedReference();
        this._editFormId = params.editFormId;
        this._rootTaskId = params.rootTaskId;
        this._createFormId = params.createFormId;
        this._bulkEditFormId = params.bulkEditFormId;
        this._isInlineCreateEnabled = deps.enableInlineCreation;
        this._isEditingEnabled = deps.enableTaskEditing;
        this._isDeletingTasksWithChildrenEnabled = params.isDeletingTasksWithChildrenEnabled ?? false;
        this._isCascadeDeleteEnabled = params.isCascadeDeleteEnabled ?? false;
        this._getFormParameters = params.form?.onGetFormParameters ?? ((operation, defaultParameters) => defaultParameters);
        this._sourceRecord = params.sourceRecord;
    }

    public async onGetRawRecords(ids: string[], select?: string): Promise<IRawRecord[]> {
        let records: IRawRecord[] = [];
        const expands = await Promise.all(this._lookupManyColumns.map(async col => {
            const referencedEntityNavigationPropertyName = col.metadata.LookupMany.ReferencedEntityNavigationPropertyName;
            const customIntersection = col.metadata.LookupMany.CustomIntersection;
            const handler = this._lookupManyHandlers[col.name] ?? new LookupManyHandler({
                entityName: this._entityName,
                navigationPropertyName: referencedEntityNavigationPropertyName!,
                customIntersection: customIntersection ? {
                    referencingEntityNavigationPropertyName: customIntersection.ReferencingEntityNavigationPropertyName
                } : undefined
            });
            this._lookupManyHandlers[col.name] = handler;
            await handler.init();
            return handler.getExpand(col.metadata.LookupMany.Select);
        }));

        if (this._customColumns.length > 0) {
            const strategy: IDataverseCustomColumnsStrategy = this._customColumnsDataProvider!.getStrategy();
            expands.push(strategy.getExpand());
        }

        const suffixParts: string[] = [];
        if (select) suffixParts.push(`$select=${select}`);
        if (expands.length > 0) suffixParts.push(`$expand=${expands.join(',')}`);
        const querySuffix = suffixParts.length > 0 ? `&${suffixParts.join('&')}` : '';

        records = await this._getRawRecordsByIds({ ids, querySuffix });

        if (this._lookupManyColumns.length > 0 || this._customColumns.length > 0) {
            for (const record of records) {
                await this._harmonizeLookupManyData(record);
                await this._harmonizenizeCustomColumnsData(record);
            }
        }
        return records;
    }

    public getProjectRecord(): ISingleRecord | null {
        return this._projectRecord ?? null;
    }
    public getSourceRecord(): ISingleRecord | null {
        return this._sourceRecord ?? null;
    }

    private async _harmonizenizeCustomColumnsData(record: IRawRecord): Promise<void> {
        for (const col of this._customColumns) {
            const strategy: IDataverseCustomColumnsStrategy = this._customColumnsDataProvider!.getStrategy();
            const value = strategy.getValueFromRawRecord(record[this._fetchXmlDataProvider.getMetadata().PrimaryIdAttribute], record, col);
            record[col.name] = value;
        }
    }

    private async _harmonizeLookupManyData(record: IRawRecord): Promise<IRawRecord> {
        const nextLinkSuffix = '@odata.nextLink';
        for (const lookupManyCol of this._lookupManyColumns) {
            const referencedEntityNavigationPropertyName = lookupManyCol.metadata.LookupMany.ReferencedEntityNavigationPropertyName;
            record[lookupManyCol.name] = await this._convertLookupManyToEntityReference(record[referencedEntityNavigationPropertyName], lookupManyCol);
            delete record[referencedEntityNavigationPropertyName];
            delete record[`${referencedEntityNavigationPropertyName}${nextLinkSuffix}`];
        }
        return record;
    }

    private async _convertLookupManyToEntityReference(data: IRawRecord[], col: IColumn): Promise<ComponentFramework.EntityReference[]> {
        const relatedEntityMetadata = await window.Xrm.Utility.getEntityMetadata(col.metadata?.Targets[0]);
        const primaryIdAttribute: string = relatedEntityMetadata.PrimaryIdAttribute;
        const primaryNameAttribute: string = relatedEntityMetadata.PrimaryNameAttribute;
        const referencingEntityNavigationPropertyName = col.metadata?.LookupMany?.CustomIntersection?.ReferencingEntityNavigationPropertyName;
        const lookupManyHandler = this._getLookupManyHandlerForColumn(col.name);

        return data.map(record => {
            let data = record;
            if (referencingEntityNavigationPropertyName) {
                data = record[referencingEntityNavigationPropertyName];
            }
            const result = {
                id: {
                    guid: data[primaryIdAttribute]
                },
                name: data[primaryNameAttribute],
                etn: relatedEntityMetadata.LogicalName,
                rawData: data
            }
            if (lookupManyHandler.isCustomIntersection()) {
                if (result.rawData) {
                    result.rawData.__intersectionId = record[lookupManyHandler.getCustomIntersectionEntityMetadata().PrimaryIdAttribute];
                }
            }
            return result;
        });
    }

    private async _getRawRecordsByIds(params: { ids: string[], querySuffix?: string }): Promise<IRawRecord[]> {
        const maxIdsPerRequest = 800;
        const batches: string[][] = [];
        const { ids, querySuffix = '' } = params;

        let currentBatch: string[] = [];
        for (const [i, taskId] of Object.entries(ids)) {
            if (currentBatch.length < maxIdsPerRequest) {
                currentBatch.push(taskId);
            } else {
                batches.push(currentBatch);
                currentBatch = [taskId];
            }
            if (+i + 1 === ids.length) {
                batches.push(currentBatch);
            }
        }

        const batchedTasks: ComponentFramework.WebApi.Entity[][] = await Promise.all(batches.map(async (batchIds) => {
            const query = `?$filter=Microsoft.Dynamics.CRM.In(PropertyName='${this._fetchXmlDataProvider.getMetadata().PrimaryIdAttribute}', PropertyValues=[${batchIds.map((id) => `'${id}'`).join(',')}])${querySuffix}`;
            const { entities } = await window.Xrm.WebApi.retrieveMultipleRecords(
                this._entityName,
                query
            );
            return entities;
        }));
        return batchedTasks.flat();
    }

    public async onInitialize(provider: ITaskDataProvider): Promise<{ columns: IColumn[]; rawData: IRawRecord[]; metadata: any; }> {
        this._provider = provider;
        this._taskTree = provider.getRecordTree();
        this._fetchXml = this._getFetchXml();
        const virtualColumns = structuredClone(provider.getColumns().filter(col => col.isVirtual));
        this._fetchXmlDataProvider = new FetchXmlDataProvider({ fetchXml: this._fetchXml, loadAllRecords: true });
        this._fetchXmlDataProvider.setColumns(provider.getColumns());
        this._fetchXmlDataProvider.setLinking(provider.getLinking());
        await this._fetchXmlDataProvider.refresh();
        this._entityName = this._fetchXmlDataProvider.getEntityName();
        this._entitySetName = this._fetchXmlDataProvider.getMetadata().EntitySetName;
        const columns = this._fetchXmlDataProvider.getColumns();
        this._customColumns = this._getCustomColumns(columns);
        this._lookupManyColumns = this._getLookupManyColumns(columns);
        this._restoreVirtualColumnMetadata(virtualColumns, columns);
        this._injectLookupManyFilterOperators(columns);
        const metadata = this._fetchXmlDataProvider.getMetadata();
        const fetchXmlProviderData = this._fetchXmlDataProvider.getRawData();
        const enrichedData = await this.onGetRawRecords(this._fetchXmlDataProvider.getSortedRecordIds(), this._fetchXmlDataProvider.getMetadata().PrimaryIdAttribute);
        const finalRawData = fetchXmlProviderData.map((record, i) => {
            return {
                ...enrichedData[i],
                ...record,
            }
        });

        if (this._projectReference) {
            this._projectMetadata = await window.Xrm.Utility.getEntityMetadata(this._projectReference.etn!);
        }
        return {
            rawData: finalRawData,
            columns,
            metadata
        }
    }

    private _getLookupManyColumns(columns: IColumn[]): ILookupManyColumn[] {
        return columns.filter(col => col.metadata?.LookupMany) as any;
    }

    private _getCustomColumns(columns: IColumn[]): IColumn[] {
        return columns.filter(col => this._customColumnsDataProvider?.isCustomColumn(col.name));
    }

    //fetch xml provider will override virtual column metadata by default, so we need to restore it after initialization.
    private _restoreVirtualColumnMetadata(virtualColumns: IColumn[], columns: IColumn[]) {
        columns.map((col, i) => {
            const virtualCol = virtualColumns.find(virtualCol => virtualCol.name === col.name);
            if (virtualCol) {
                columns[i] = virtualCol;
            }
        });
    }

    private _injectLookupManyFilterOperators(columns: IColumn[]) {
        columns.map(col => {
            if (col.metadata?.LookupMany) {
                col.metadata = {
                    ...col.metadata,
                    SupportedFilterConditionOperators: Operators.GetOperatorsForDataType(DataTypes.MultiSelectOptionSet).map(op => op.Value)
                }
            }
        })
    }

    private _getFieldMapping(): IFieldMapping {
        return this._provider.getNativeColumns() as IFieldMapping;
    }

    private _getFetchXml(): string {
        return LIQUID.parseAndRenderSync(this._fetchXml, {
            project: {
                id: this._projectReference?.id.guid,
                ...this._projectRecord?.getRawData()
            },
            currentRecord: {
                id: this._sourceRecord?.getNamedReference().id.guid,
                ...this._sourceRecord?.getRawData()
            }
        })
    }

    public async onGetAvailableColumns(options?: IAvailableColumnOptions): Promise<IColumn[]> {
        return this._fetchXmlDataProvider.getAvailableColumns(options);
    }
    public async onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return this._fetchXmlDataProvider.getAvailableRelatedColumns();
    }
    
    public async onCreateTask(parentTaskId?: string): Promise<IRawRecord | null> {
        const data: { [key: string]: any } = {};
        let pageInput: Xrm.Navigation.PageInputEntityRecord = {
            pageType: 'entityrecord',
            entityName: this._entityName,
            data: data,
            formId: this._createFormId
        };
        //prefill project
        if (this._projectReference) {
            const projectIdColumnName = this._getFieldMapping().projectId;
            data[`${projectIdColumnName}`] = this._projectReference.id.guid;
            data[`${projectIdColumnName}name`] = this._projectReference.name;
            data[`${projectIdColumnName}type`] = this._projectReference.etn;
        }
        //prefill parent task
        if (parentTaskId) {
            const parentIdColumnName = this._getFieldMapping().parentId;
            data[`${parentIdColumnName}`] = parentTaskId;
            data[`${parentIdColumnName}name`] = this._provider.getRecordsMap()[parentTaskId].getNamedReference().name;
            data[`${parentIdColumnName}type`] = this._entityName;
        }
        const node = this._taskTree.getNode(parentTaskId ?? null);
        let payload: { [key: string]: any } = {};
        payload[`${this._getFieldMapping().stackRank}`] = await this._updateStackRank({ previousTaskId: undefined, nextTaskId: node.directChildren[0]?.getRecordId(), skipSave: true });

        if (this._projectReference) {
            payload[`${await this._getNavigationalPropertyName(this._projectReference.etn!, this._getFieldMapping().projectId!)}@odata.bind`] = `/${this._projectMetadata?.EntitySetName}(${this._projectReference.id.guid})`;
        }
        if (parentTaskId) {
            payload[`${await this._getNavigationalPropertyName(this._entityName, this._getFieldMapping().parentId)}@odata.bind`] = `/${this._entitySetName}(${parentTaskId})`;
        }
        if (this._isInlineCreateEnabled) {
            const result = await window.Xrm.WebApi.createRecord(this._entityName, payload);
            const rawRecord = (await this.onGetRawRecords([result.id]))[0];
            return rawRecord;
        }

        const { pageInput: resolvedPageInput, navigationOptions: resolvedNavigationOptions } = this._getFormParameters('create', {
            pageInput,
            navigationOptions: this._getFormNavigationOptions()
        });
        const navigateToResult = await Xrm.Navigation.navigateTo(resolvedPageInput, resolvedNavigationOptions);
        if (navigateToResult.savedEntityReference) {
            const entityReference = Sanitizer.Lookup.getEntityReference(navigateToResult.savedEntityReference[0]);
            await window.Xrm.WebApi.updateRecord(this._entityName, entityReference.id.guid, payload);
            const rawRecord = (await this.onGetRawRecords([entityReference.id.guid]))[0];
            return rawRecord;
        }
        else {
            return null;
        }
    }
    
    public async onDeleteTasks(taskIds: string[]): Promise<IDeleteTasksResult | null> {
        const allTaskIds: Set<string> = new Set(taskIds);
        let success = true;
        const notDeletableTaskIds: string[] = [];
        if (this._isCascadeDeleteEnabled) {
            for (const taskId of taskIds) {
                const children = this._taskTree.getNode(taskId)?.allChildren.map(c => c.getRecordId()) ?? [];
                children.map(id => allTaskIds.add(id));
            }
        }
        if (!this._isDeletingTasksWithChildrenEnabled) {
            for (const taskId of allTaskIds) {
                if (this._taskTree.hasChildren(taskId)) {
                    success = false;
                    allTaskIds.delete(taskId);
                    notDeletableTaskIds.push(taskId);
                }
            }
        }
        const result = await this._fetchXmlDataProvider.deleteRecords([...allTaskIds]);
        return {
            success: result.success && success,
            deletedTaskIds: [...allTaskIds],
            errors: [...result.results.filter(result => !result.success).map(result => {
                return {
                    id: result.recordId,
                    error: result.errorMessage
                }
            }), ...notDeletableTaskIds.map(id => {
                return {
                    id,
                    //TODO: localize
                    error: 'Cannot delete task with children.'
                }
            })]
        }
    }
    public onCreateTemplateFromTask(taskId: string): Promise<IRawRecord | null> {
        throw new Error("Method not implemented.");
    }
    public onCreateTasksFromTemplate(templateId: string, parentTaskId?: string): Promise<IRawRecord[] | null> {
        throw new Error("Method not implemented.");
    }
    public async onOpenDatasetItems(entityReferences: ComponentFramework.EntityReference[], isTaskEntity: boolean ): Promise<IOpenDatasetItemsResult | null> {
        if (!isTaskEntity) {
            // Navigate to related entity (lookup target)
            const { pageInput, navigationOptions } = this._getFormParameters('open', {
                pageInput: {
                    pageType: 'entityrecord',
                    entityName: entityReferences[0].etn!,
                    entityId: entityReferences[0].id.guid,
                },
                navigationOptions: this._getFormNavigationOptions()
            });
            await window.Xrm.Navigation.navigateTo(pageInput, navigationOptions);
            return null;
        }
        if (entityReferences.length === 1) {
            const rawRecord = await this._editSingleTask(entityReferences[0].id.guid);
            if (!rawRecord) return null;
            return { success: true, updatedRecords: [rawRecord] };
        }
        const result = await this._editMultipleTasks(entityReferences.map(ref => ref.id.guid));
        return result;
    }
    public async onMoveTask(movingTaskId: string, movingToTaskId: string, position: "above" | "below" | "child"): Promise<IRawRecord[] | null> {
        const movingToRecord = this._provider.getRecordsMap()[movingToTaskId];
        let payload: { [key: string]: any } = {};
        if (position === 'child') {
            //change parent
            payload[`${await this._getNavigationalPropertyName(this._entityName, this._getFieldMapping().parentId)}@odata.bind`] = `/${this._entitySetName}(${movingToTaskId})`;
            const firstChild = this._taskTree.getNode(movingToTaskId).directChildren
                .find(c => c.getRecordId() !== movingTaskId);
            if (firstChild) {
                //change stack rank to be before first child
                payload[`${this._getFieldMapping().stackRank}`] = await this._updateStackRank({ recordId: movingTaskId, previousTaskId: undefined, nextTaskId: firstChild.getRecordId(), skipSave: true });
            }
            await window.Xrm.WebApi.updateRecord(this._entityName, movingTaskId, payload);
            const rawRecord = (await this.onGetRawRecords([movingTaskId]))[0];
            return [rawRecord];
        }
        else {
            const movingToRecordParent = this._taskTree.getNodeMap().get(movingToRecord.getRecordId())?.parent;
            payload[`${await this._getNavigationalPropertyName(this._entityName, this._getFieldMapping().parentId)}@odata.bind`] = movingToRecordParent ? `/${this._entitySetName}(${movingToRecordParent.getRecordId()})` : null;

            const movingToRecordNode = this._taskTree.getNodeMap().get(movingToRecord.getRecordId())!;
            const siblings = this._taskTree.getNodeMap().get(movingToRecordParent?.getRecordId() ?? null as any)?.directChildren ?? [];

            let prevSiblingId: string | undefined;
            let nextSiblingId: string | undefined;
            if (position === 'above') {
                prevSiblingId = siblings[movingToRecordNode.index - 1]?.getRecordId();
                nextSiblingId = movingToRecord.getRecordId();
            } else {
                prevSiblingId = movingToRecord.getRecordId();
                nextSiblingId = siblings[movingToRecordNode.index + 1]?.getRecordId();
            }
            payload[`${this._getFieldMapping().stackRank}`] = await this._updateStackRank({ recordId: movingTaskId, previousTaskId: prevSiblingId, nextTaskId: nextSiblingId, skipSave: true });
            await window.Xrm.WebApi.updateRecord(this._entityName, movingTaskId, payload);
            const rawRecord = (await this.onGetRawRecords([movingTaskId]))[0];
            return [rawRecord];
        }
    }

    /**
     * Saves a single dirty field on a task record.
     * Lookup-many fields are persisted through their dedicated {@link LookupManyHandler}; all other fields use the standard FetchXML provider save path.
     * TaskGrid uses auto-save, so exactly one dirty field is expected per call.
     */
    public async onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        const dirtyField = record.getFields().find(field => field.isDirty());
        const column = dirtyField?.getColumn();
        if (column?.metadata?.LookupMany) {
            const handler = this._getLookupManyHandlerForColumn(column.name);
            return handler.saveRecord(record, column.name);
        }
        else if (column?.name.endsWith(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX)) {
            return this._customColumnsDataProvider!.saveValue(record.getRecordId(), column, dirtyField?.getValue());
        }
        else {
            return (<FetchXmlDataProvider>this._fetchXmlDataProvider).onRecordSave(record);
        }
    }

    /** Returns `true` when the task's `stateCode` attribute equals `0` (active). */
    public onIsRecordActive(recordId: string): boolean {
        const record = this._provider.getRecordsMap()[recordId];
        return record.getValue(this._provider.getNativeColumns().stateCode) == 0;
    }


    /** Returns the root task ID used to scope the displayed hierarchy. */
    public onGetRootTaskId?(): string | undefined {
        return this._rootTaskId;
    }

    private async _getNavigationalPropertyName(referencedEntityName: string, referencingAttribute: string): Promise<string> {
        const metadata: any = await window.Xrm.Utility.getEntityMetadata(this._entityName);
        const relationship = metadata.ManyToOneRelationships.getAll().find((rel: any) =>
            rel.ReferencedEntity === referencedEntityName &&
            rel.ReferencingAttribute === referencingAttribute
        );
        if (!relationship) {
            throw new Error(`Could not find many-to-one relationship targeting ${referencedEntityName} on ${metadata.LogicalName}`);
        }
        return relationship.ReferencingEntityNavigationPropertyName;
    }

    private _getFormNavigationOptions(): Xrm.Navigation.NavigationOptions {
        return {
            target: 2,
            width: { value: 80, unit: '%' },
            position: 1,
        };
    }

    private _getLookupManyHandlerForColumn(colName: string): LookupManyHandler {
        const handler = this._lookupManyHandlers[colName];
        if (!handler) {
            throw new Error(`No LookupManyHandler found for column ${colName}`);
        }
        return handler;
    }

    private async _editSingleTask(recordId: string): Promise<IRawRecord | null> {
        const { pageInput, navigationOptions } = this._getFormParameters('edit', {
            pageInput: {
                pageType: 'entityrecord',
                entityName: this._entityName,
                entityId: recordId,
                formId: this._editFormId,
                data: {
                    isEditingEnabled: this._isEditingEnabled
                }
            },
            navigationOptions: this._getFormNavigationOptions()
        })

        await window.Xrm.Navigation.navigateTo(pageInput, navigationOptions);
        const result = await this.onGetRawRecords([recordId]);
        return result[0];
    }

    private async _editMultipleTasks(recordIds: string[]): Promise<IOpenDatasetItemsResult | null> {
        const { pageInput, navigationOptions } = this._getFormParameters('bulkEdit', {
            //@ts-ignore - not documented, passing of record id array is possible in Power Apps - https://butenko.pro/2021/10/14/howto-open-bulk-editing-of-records-using-xrm-navigation-navigateto/
            pageInput: {
                //@ts-ignore - typings
                pageType: 'bulkedit',
                entityName: this._entityName,
                entityIds: recordIds,
                formId: this._bulkEditFormId
            },
            navigationOptions: {
                target: 2,
                position: 2,
            }
        });
        await window.Xrm.Navigation.navigateTo(pageInput, navigationOptions);
        const rawRecords = await this.onGetRawRecords(recordIds);
        return { success: true, updatedRecords: rawRecords };
    }

    private async _updateStackRank(params: { recordId?: string, previousTaskId?: string, nextTaskId?: string; skipSave?: boolean }): Promise<string> {
        const stackRankCol = this._getFieldMapping().stackRank;
        const rawDataMap = this._provider.getRawDataMap();

        const prevRankStr = params.previousTaskId ? (rawDataMap[params.previousTaskId]?.[stackRankCol] as string) : undefined;
        const nextRankStr = params.nextTaskId ? (rawDataMap[params.nextTaskId]?.[stackRankCol] as string) : undefined;

        let newRank: string;
        if (prevRankStr && nextRankStr) {
            newRank = LexoRank.parse(prevRankStr).between(LexoRank.parse(nextRankStr)).format();
        } else if (nextRankStr) {
            newRank = LexoRank.parse(nextRankStr).genPrev().format();
        } else if (prevRankStr) {
            newRank = LexoRank.parse(prevRankStr).genNext().format();
        } else {
            newRank = LexoRank.middle().format();
        }
        if (!params.skipSave && params.recordId) {
            await window.Xrm.WebApi.updateRecord(this._entityName, params.recordId, {
                [stackRankCol]: newRank
            });
        }
        return newRank;
    }

}