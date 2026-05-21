import { IRecord, IFetchXmlDataProvider, IRawRecord, FetchXmlDataProvider, FetchXmlBuilder, IAvailableColumnOptions, IAvailableRelatedColumn, IRecordSaveOperationResult, IColumn, Sanitizer } from "@talxis/client-libraries";
import { ITaskDataProviderStrategy, ITaskDataProvider, IDeleteTasksResult, IEditTasksResult } from "../../providers";
import { IRecordTree } from "../../providers/task/record-tree";
import { LexoRank } from "../LexoRank";
import { LOOKUP_MANY_COLUMN_NAME_SUFFIX, LookupManyHandler } from "./lookup-many/LookupManyHandler";
import { Liquid } from "liquidjs";
import { IFieldMapping } from "./DataverseTaskGridDescriptor";


interface IFormParameters {
    pageInput: Xrm.Navigation.PageInputEntityRecord;
    navigationOptions: Xrm.Navigation.NavigationOptions;
}

export interface IDataverseTaskStrategyParams {
    fetchXml: string;
    isInlineCreateEnabled?: boolean;
    isEditingEnabled?: boolean;
    editFormId?: string;
    createFormId?: string;
    bulkEditFormId?: string;
    projectReference?: ComponentFramework.EntityReference;
    rootTaskId?: string;
    formStrategy?: {
        onGetFormParameters?: (operation: 'create' | 'edit' | 'bulkEdit' | 'open', defaultParameters: IFormParameters) => IFormParameters;
    }
}

interface ILookupManyColumn extends IColumn {
    navigationPropertyName: string
}

export interface IDataverseTaskStrategy extends ITaskDataProviderStrategy {
    getProjectReference(): ComponentFramework.EntityReference | null;
}

const LIQUID = new Liquid();

export class DataverseTaskStrategy implements IDataverseTaskStrategy {
    private _fetchXml: string;
    private _entitySetName!: string;
    private _entityName!: string;
    private _projectReference?: ComponentFramework.EntityReference;
    private _projectMetadata?: Xrm.Metadata.EntityMetadata;
    private _rootTaskId?: string;
    private _taskTree!: IRecordTree;
    private _provider!: ITaskDataProvider;
    private _editFormId?: string;
    private _createFormId?: string
    private _bulkEditFormId?: string;
    private _fetchXmlDataProvider!: IFetchXmlDataProvider;
    private _isInlineCreateEnabled: boolean;
    private _isEditingEnabled: boolean;
    private _lookupManyColumns: ILookupManyColumn[] = [];
    private _lookupManyHandlers: { [colName: string]: LookupManyHandler } = {};
    private _getFormParameters: (operation: 'create' | 'edit' | 'bulkEdit' | 'open', defaultParameters: IFormParameters) => IFormParameters;


    constructor(params: IDataverseTaskStrategyParams) {
        this._fetchXml = params.fetchXml;
        this._projectReference = params.projectReference;
        this._editFormId = params.editFormId;
        this._rootTaskId = params.rootTaskId;
        this._createFormId = params.createFormId;
        this._bulkEditFormId = params.bulkEditFormId;
        this._isInlineCreateEnabled = params.isInlineCreateEnabled ?? true;
        this._isEditingEnabled = params.isEditingEnabled ?? true;
        this._getFormParameters = params.formStrategy?.onGetFormParameters ?? ((operation, defaultParameters) => defaultParameters);
    }

    public async onGetRawRecords(ids: string[], select?: string): Promise<IRawRecord[]> {
        let records: IRawRecord[] = [];
        const expands = await Promise.all(this._lookupManyColumns.map(async col => {
            const referencedEntityNavigationPropertyName = col.navigationPropertyName;
            const handler = this._lookupManyHandlers[col.name] ?? new LookupManyHandler({
                entityName: this._entityName,
                navigationPropertyName: referencedEntityNavigationPropertyName
            });
            this._lookupManyHandlers[col.name] = handler;
            await handler.init();
            return handler.getExpand();
        }));

        const parts: string[] = [];
        if (select) parts.push(`$select=${select}`);
        if (expands.length > 0) parts.push(`$expand=${expands.join(',')}`);

        const query = `?$filter=Microsoft.Dynamics.CRM.In(PropertyName='${this._fetchXmlDataProvider.getMetadata().PrimaryIdAttribute}', PropertyValues=[${ids.map((id) => `'${id}'`).join(',')}])${parts.length > 0 ? `&${parts.join('&')}` : ''}`;
        records = await this._getRawRecordsByIds({ ids, query });

        if (this._lookupManyColumns.length > 0) {
            await Promise.all(records.map(record => this._harmonizeLookupManyData(record)));
        }
        return records;
    }

    public getProjectReference(): ComponentFramework.EntityReference | null {
        return this._projectReference ?? null;
    }

    private async _harmonizeLookupManyData(record: IRawRecord): Promise<IRawRecord> {
        const nextLinkSuffix = '@odata.nextLink';
        for (const lookupManyCol of this._lookupManyColumns) {
            const referencedEntityNavigationPropertyName = lookupManyCol.navigationPropertyName;
            record[lookupManyCol.name] = await this._convertLookupManyToEntityReference(record[referencedEntityNavigationPropertyName], lookupManyCol);
            delete record[referencedEntityNavigationPropertyName];
            delete record[`${referencedEntityNavigationPropertyName}${nextLinkSuffix}`];
        }
        return record;
    }

    private async _convertLookupManyToEntityReference(data: IRawRecord[], col: IColumn): Promise<ComponentFramework.EntityReference[]> {
        const metadata = await window.Xrm.Utility.getEntityMetadata(col.metadata?.Targets[0]);
        return data.map(record => {
            return {
                id: {
                    guid: record[metadata.PrimaryIdAttribute]
                },
                name: record[metadata.PrimaryNameAttribute],
                etn: metadata.LogicalName,
                rawData: record
            }
        });
    }

    private async _getRawRecordsByIds(params: { ids: string[], query: string }): Promise<IRawRecord[]> {
        const maxIdsPerRequest = 800;
        const batches: string[][] = [];
        const { ids, query } = params;

        let currentBatch: string[] = [];
        for (const [i, taskId] of Object.entries(ids)) {
            if (currentBatch.length <= maxIdsPerRequest) {
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

        this._fetchXmlDataProvider = new FetchXmlDataProvider({ fetchXml: this._fetchXml, loadAllRecords: true });
        this._fetchXmlDataProvider.setColumns(provider.getColumns());
        this._fetchXmlDataProvider.setLinking(provider.getLinking());
        await this._fetchXmlDataProvider.refresh();
        this._entityName = this._fetchXmlDataProvider.getEntityName();
        this._entitySetName = this._fetchXmlDataProvider.getMetadata().EntitySetName;
        this._lookupManyColumns = this._getLookupManyColumns();
        const columns = this._fetchXmlDataProvider.getColumns();
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

    private _getLookupManyColumns(): ILookupManyColumn[] {
        return this._fetchXmlDataProvider.getColumns().filter(col => col.name.endsWith(LOOKUP_MANY_COLUMN_NAME_SUFFIX)).map(col => {
            return {
                ...col,
                navigationPropertyName: col.name.replace(LOOKUP_MANY_COLUMN_NAME_SUFFIX, '')
            }
        })
    }

    private _getFieldMapping(): IFieldMapping {
        return this._provider.getNativeColumns() as IFieldMapping;
    }

    private _getFetchXml(): string {
        return LIQUID.parseAndRenderSync(this._fetchXml, {
            projectId: this._projectReference?.id.guid,
        })
    }

    public async onGetAvailableColumns(options?: IAvailableColumnOptions): Promise<IColumn[]> {
        return this._fetchXmlDataProvider.getAvailableColumns(options);
    }
    public async onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return this._fetchXmlDataProvider.getAvailableRelatedColumns();
    }
    public onGetQuickFindColumns(): string[] {
        return [];
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
        const result = await this._fetchXmlDataProvider.deleteRecords(taskIds);
        if (result.success) {
            return {
                success: true,
                deletedTaskIds: taskIds
            }
        }
        else {
            return {
                success: false,
                deletedTaskIds: result.results.filter(result => result.success).map(result => result.recordId),
                errors: result.results.filter(result => !result.success).map(result => {
                    return {
                        id: result.recordId,
                        error: result.errorMessage
                    }
                })
            }
        }
    }
    public onCreateTemplateFromTask(taskId: string): Promise<IRawRecord | null> {
        throw new Error("Method not implemented.");
    }
    public onCreateTasksFromTemplate(templateId: string, parentTaskId?: string): Promise<IRawRecord[] | null> {
        throw new Error("Method not implemented.");
    }
    public async onEditTasks(taskIds: string[]): Promise<IEditTasksResult | null> {
        if (taskIds.length === 1) {
            const result = await this._editSingleTask(taskIds[0]);
            if (!result) return null;
            return {
                success: true,
                updatedRecords: [result]
            }
        }
        return this._editMultipleTasks(taskIds);
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

    //Task Grid only works with auto save => we always expect only one diry field
    public async onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        const dirtyField = record.getFields().find(field => field.isDirty());
        if (dirtyField?.getColumn().name.endsWith(LOOKUP_MANY_COLUMN_NAME_SUFFIX)) {
            const handler = this._getLookupManyHandlerForColumn(dirtyField.getColumn().name);
            return handler.saveRecord(record, dirtyField.getColumn().name);
        }
        else {
            return (<FetchXmlDataProvider>this._fetchXmlDataProvider).onRecordSave(record);
        }
    }

    public onIsRecordActive(recordId: string): boolean {
        const record = this._provider.getRecordsMap()[recordId];
        return record.getValue(this._provider.getNativeColumns().stateCode) == 0;
    }

    public async onOpenDatasetItem(entityReference: ComponentFramework.EntityReference, context?: { columnName?: string }): Promise<void> {
        const { pageInput, navigationOptions } = this._getFormParameters('open', {
            pageInput: {
                pageType: 'entityrecord',
                entityName: entityReference.etn!,
                entityId: entityReference.id.guid,
            },
            navigationOptions: this._getFormNavigationOptions()
        });
        await window.Xrm.Navigation.navigateTo(pageInput, navigationOptions);
    }
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

    private async _editMultipleTasks(recordIds: string[]): Promise<IEditTasksResult | null> {
        const { pageInput, navigationOptions} = this._getFormParameters('bulkEdit', {
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
        return {
            success: true,
            updatedRecords: rawRecords
        };
    }

    private async _updateStackRank(params: { recordId?: string, previousTaskId?: string, nextTaskId?: string; skipSave?: boolean }): Promise<string> {
        const stackRankCol = this._getFieldMapping().stackRank;
        const rawDataMap = this._provider.getRawDataMap();

        const prevRank = params.previousTaskId ? (rawDataMap[params.previousTaskId]?.[stackRankCol] as string) : undefined;
        const nextRank = params.nextTaskId ? (rawDataMap[params.nextTaskId]?.[stackRankCol] as string) : undefined;

        let newRank: string;
        if (prevRank && nextRank) {
            newRank = LexoRank.between(prevRank, nextRank);
        } else if (nextRank) {
            newRank = LexoRank.before(nextRank);
        } else if (prevRank) {
            newRank = LexoRank.after(prevRank);
        } else {
            newRank = LexoRank.between(LexoRank.MIN, LexoRank.MAX);
        }
        if (!params.skipSave && params.recordId) {
            await window.Xrm.WebApi.updateRecord(this._entityName, params.recordId, {
                [stackRankCol]: newRank
            });
        }
        return newRank;
    }

}