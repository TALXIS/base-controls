import { IRecord, IFetchXmlDataProvider, IRawRecord, FetchXmlDataProvider, IAvailableColumnOptions, IAvailableRelatedColumn, IRecordSaveOperationResult, IColumn, Operators, DataTypes, ISingleRecord } from "@talxis/client-libraries";
import {
    IDeleteTasksResult,
    IOpenDatasetItemsResult,
    ITaskCreateParams,
    ITaskDataProvider,
    ITaskDataProviderStrategy,
    ITaskMoveParams,
    ITaskTemplateExpansionParams,
} from "@components/TaskGrid/providers";
import { ICustomColumnsDataProvider } from "@components/TaskGrid/modules/custom-columns/CustomColumnsDataProvider";
import { Liquid } from "liquidjs";
import { IDataverseFieldMapping } from "@components/TaskGrid/descriptors/dataverse/DataverseTaskGridDescriptor";
import { LookupManyHandler } from "./LookupManyHandler";
import { ITaskStrategyDeps } from "@components/TaskGrid/interfaces";
import { ITalxisCustomColumnsStrategy } from "@components/TaskGrid/modules/custom-columns/talxis";
import {
    DataverseFormOperation,
    DataverseTaskActions,
    IDataverseTaskActivityParams,
    IDataverseTaskAvailableColumnsParams,
    IDataverseTaskAvailableRelatedColumnsParams,
    IDataverseTaskCreateParams,
    IDataverseTaskDeleteParams,
    IDataverseTaskMoveParams,
    IDataverseTaskOpenParams,
    IDataverseTaskSaveParams,
    IDataverseTaskTemplateExpansionParams,
    IFormParameters,
} from "./DataverseTaskActions";

/**
 * Constructor parameters for {@link DataverseTaskStrategy}: the required `onInitialize` hook, and an
 * optional hook per operation.
 *
 * Each optional hook replaces the matching {@link DataverseTaskActions} action and receives its exact
 * parameters, so an override can forward them straight back to it.
 */
export interface IDataverseTaskStrategyParams {
    /**
     * Resolves the FetchXML and the options the strategy runs on. Awaited inside the strategy's own
     * `onInitialize`, so anything it needs can be fetched or computed while the grid shows its skeleton.
     */
    onInitialize: () => Promise<IDataverseTaskInitializeResult>;
    /**
     * Supplies the column catalogue the Edit columns panel offers. Defaults to
     * {@link DataverseTaskActions.getAvailableColumns} — the task entity's attributes.
     */
    onGetAvailableColumns?: (params: IDataverseTaskAvailableColumnsParams) => Promise<IColumn[]>;
    /**
     * Supplies the related columns the Edit columns panel offers. Defaults to
     * {@link DataverseTaskActions.getAvailableRelatedColumns} — the task entity's relationships.
     */
    onGetAvailableRelatedColumns?: (params: IDataverseTaskAvailableRelatedColumnsParams) => Promise<IAvailableRelatedColumn[]>;
    /**
     * Creates one task. Defaults to {@link DataverseTaskActions.createTask}, which either creates
     * through the Web API or opens the create form, depending on `enableInlineCreation`.
     */
    onCreateTask?: (params: IDataverseTaskCreateParams) => Promise<IRawRecord | null>;
    /**
     * Deletes tasks. Defaults to {@link DataverseTaskActions.deleteTasks}, which honours
     * {@link IDataverseTaskInitializeResult.isCascadeDeleteEnabled} and refuses tasks with children.
     */
    onDeleteTasks?: (params: IDataverseTaskDeleteParams) => Promise<IDeleteTasksResult | null>;
    /**
     * Expands a template into a task subtree. There is no Dataverse implementation — the default
     * {@link DataverseTaskActions.createTasksFromTemplate} throws — so supply this to support templates
     * against your own model.
     */
    onCreateTasksFromTemplate?: (params: IDataverseTaskTemplateExpansionParams) => Promise<IRawRecord[] | null>;
    /**
     * Opens task(s) or a related record. Defaults to {@link DataverseTaskActions.openDatasetItems},
     * which navigates to the matching form. For per-form tweaks prefer `onGetFormParameters` below,
     * which the default already routes through.
     */
    onOpenDatasetItems?: (params: IDataverseTaskOpenParams) => Promise<IOpenDatasetItemsResult | null>;
    /**
     * Reorders or reparents a task. Defaults to {@link DataverseTaskActions.moveTask}, which rewrites
     * the parent lookup and the LexoRank stack rank.
     */
    onMoveTask?: (params: IDataverseTaskMoveParams) => Promise<IRawRecord[] | null>;
    /**
     * Persists an inline edit. Defaults to {@link DataverseTaskActions.saveRecord}, which routes
     * lookup-many and custom columns to their own providers.
     */
    onRecordSave?: (params: IDataverseTaskSaveParams) => Promise<IRecordSaveOperationResult>;
    /**
     * Determines whether a task counts as active. Defaults to
     * {@link DataverseTaskActions.isRecordActive} — `record[stateCode] == 0`.
     */
    onIsRecordActive?: (params: IDataverseTaskActivityParams) => boolean;
    /**
     * Rewrites the `Xrm.Navigation.navigateTo` arguments of any form the grid opens (`create`, `edit`,
     * `bulkEdit`, `open`). Return the given parameters to keep the defaults.
     *
     * The narrow way in: every action that opens a form routes through this, so a change to the dialog
     * size or the form id does not mean overriding the operation itself.
     */
    onGetFormParameters?: (operation: DataverseFormOperation, defaultParameters: IFormParameters) => IFormParameters;
}

/** What {@link IDataverseTaskStrategyParams.onInitialize} resolves. */
export interface IDataverseTaskInitializeResult {
    /** FetchXML used to load tasks. May contain Liquid template variables (e.g. `{{ projectId }}`). */
    fetchXml: string;
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

const LIQUID = new Liquid();

/**
 * Ready-to-use {@link ITaskDataProviderStrategy} implementation for the Dataverse / Talxis platform.
 *
 * Handles all task CRUD operations, drag-and-drop reordering (via LexoRank), and lookup-many
 * expand/associate handling — all backed by the Xrm WebApi and FetchXML.
 *
 * Normally instantiated automatically by {@link DataverseTaskGridDescriptor}. Construct directly only
 * when you need to pass a custom `formStrategy` or override specific behaviour.
 */
export class DataverseTaskStrategy implements ITaskDataProviderStrategy {
    private _params: IDataverseTaskStrategyParams;
    private _fetchXml!: string;
    private _entitySetName!: string;
    private _entityName!: string;
    private _projectReference?: ComponentFramework.EntityReference;
    private _projectRecord?: ISingleRecord;
    private _projectMetadata?: Xrm.Metadata.EntityMetadata;
    private _rootTaskId?: string;
    private _provider!: ITaskDataProvider;
    private _editFormId?: string;
    private _createFormId?: string;
    private _bulkEditFormId?: string;
    private _fetchXmlDataProvider!: IFetchXmlDataProvider;
    private _isInlineCreateEnabled: boolean;
    private _isEditingEnabled: boolean;
    private _isDeletingTasksWithChildrenEnabled = false;
    private _isCascadeDeleteEnabled = false;
    private _lookupManyColumns: ILookupManyColumn[] = [];
    private _customColumns: IColumn[] = [];
    private _sourceRecord?: ISingleRecord;
    private _customColumnsDataProvider?: ICustomColumnsDataProvider;
    private _lookupManyHandlers: { [colName: string]: LookupManyHandler } = {};


    constructor(params: IDataverseTaskStrategyParams, deps: ITaskStrategyDeps) {
        this._params = params;
        this._customColumnsDataProvider = deps.customColumnsDataProvider;
        this._isInlineCreateEnabled = deps.enableInlineCreation;
        this._isEditingEnabled = deps.enableTaskEditing;
    }

    public async onInitialize(provider: ITaskDataProvider): Promise<{ columns: IColumn[]; rawData: IRawRecord[]; metadata: any; }> {
        const dependencies = await this._params.onInitialize();
        this._fetchXml = dependencies.fetchXml;
        this._projectRecord = dependencies.projectRecord;
        this._projectReference = this._projectRecord?.getNamedReference();
        this._sourceRecord = dependencies.sourceRecord;
        this._editFormId = dependencies.editFormId;
        this._rootTaskId = dependencies.rootTaskId;
        this._createFormId = dependencies.createFormId;
        this._bulkEditFormId = dependencies.bulkEditFormId;
        this._isDeletingTasksWithChildrenEnabled = dependencies.isDeletingTasksWithChildrenEnabled ?? false;
        this._isCascadeDeleteEnabled = dependencies.isCascadeDeleteEnabled ?? false;
        this._provider = provider;
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
        const primaryIdAttribute = this._fetchXmlDataProvider.getMetadata().PrimaryIdAttribute;
        const enrichedData = await this.onGetRawRecords(this._fetchXmlDataProvider.getSortedRecordIds(), primaryIdAttribute);
        const enrichedDataMap = new Map<string, IRawRecord>(
            enrichedData.map(record => [record[primaryIdAttribute] as string, record])
        );
        const finalRawData = fetchXmlProviderData.map((record) => {
            const id = record[primaryIdAttribute] as string;
            return {
                ...enrichedDataMap.get(id),
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
            const strategy: ITalxisCustomColumnsStrategy = this._customColumnsDataProvider!.getStrategy();
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

    private async _harmonizenizeCustomColumnsData(record: IRawRecord): Promise<void> {
        for (const col of this._customColumns) {
            const strategy: ITalxisCustomColumnsStrategy = this._customColumnsDataProvider!.getStrategy();
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

    /** Routes a form's parameters through the `onGetFormParameters` hook, defaulting to no change. */
    private _getFormParameters = (operation: DataverseFormOperation, defaultParameters: IFormParameters): IFormParameters =>
        this._params.onGetFormParameters?.(operation, defaultParameters) ?? defaultParameters;

    /** What every write needs to address a task: the entity, its set, the mapping and the provider. */
    private get _entity(): { entityName: string; entitySetName: string; fieldMapping: IDataverseFieldMapping; provider: ITaskDataProvider } {
        return {
            entityName: this._entityName,
            entitySetName: this._entitySetName,
            fieldMapping: this._getFieldMapping(),
            provider: this._provider,
        };
    }

    private _getFieldMapping(): IDataverseFieldMapping {
        return this._provider.getNativeColumns() as IDataverseFieldMapping;
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
        const params: IDataverseTaskAvailableColumnsParams = { fetchXmlDataProvider: this._fetchXmlDataProvider, options };
        return await this._params.onGetAvailableColumns?.(params)
            ?? DataverseTaskActions.getAvailableColumns(params);
    }

    public async onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        const params: IDataverseTaskAvailableRelatedColumnsParams = { fetchXmlDataProvider: this._fetchXmlDataProvider };
        return await this._params.onGetAvailableRelatedColumns?.(params)
            ?? DataverseTaskActions.getAvailableRelatedColumns(params);
    }

    public async onCreateTask(createParams: ITaskCreateParams): Promise<IRawRecord | null> {
        const params: IDataverseTaskCreateParams = {
            ...createParams,
            ...this._entity,
            isInlineCreateEnabled: this._isInlineCreateEnabled,
            createFormId: this._createFormId,
            projectReference: this._projectReference,
            projectMetadata: this._projectMetadata,
            onGetFormParameters: this._getFormParameters,
            onGetRawRecords: ids => this.onGetRawRecords(ids),
        };
        return await this._params.onCreateTask?.(params)
            ?? DataverseTaskActions.createTask(params);
    }

    public async onDeleteTasks(taskIds: string[]): Promise<IDeleteTasksResult | null> {
        const params: IDataverseTaskDeleteParams = {
            taskIds,
            provider: this._provider,
            fetchXmlDataProvider: this._fetchXmlDataProvider,
            isCascadeDeleteEnabled: this._isCascadeDeleteEnabled,
            isDeletingTasksWithChildrenEnabled: this._isDeletingTasksWithChildrenEnabled,
        };
        return await this._params.onDeleteTasks?.(params)
            ?? DataverseTaskActions.deleteTasks(params);
    }

    public onCreateTasksFromTemplate(expansionParams: ITaskTemplateExpansionParams): Promise<IRawRecord[] | null> {
        const params: IDataverseTaskTemplateExpansionParams = { ...expansionParams };
        return this._params.onCreateTasksFromTemplate?.(params)
            ?? DataverseTaskActions.createTasksFromTemplate(params);
    }
    public async onOpenDatasetItems(entityReferences: ComponentFramework.EntityReference[], isTaskEntity: boolean): Promise<IOpenDatasetItemsResult | null> {
        const params: IDataverseTaskOpenParams = {
            entityReferences,
            isTaskEntity,
            entityName: this._entityName,
            isTaskEditingEnabled: this._isEditingEnabled,
            editFormId: this._editFormId,
            bulkEditFormId: this._bulkEditFormId,
            onGetFormParameters: this._getFormParameters,
            onGetRawRecords: ids => this.onGetRawRecords(ids),
        };
        return await this._params.onOpenDatasetItems?.(params)
            ?? DataverseTaskActions.openDatasetItems(params);
    }

    public async onMoveTask(moveParams: ITaskMoveParams): Promise<IRawRecord[] | null> {
        const params: IDataverseTaskMoveParams = {
            ...moveParams,
            ...this._entity,
            onGetRawRecords: ids => this.onGetRawRecords(ids),
        };
        return await this._params.onMoveTask?.(params)
            ?? DataverseTaskActions.moveTask(params);
    }

    public async onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        const params: IDataverseTaskSaveParams = {
            record,
            fetchXmlDataProvider: this._fetchXmlDataProvider,
            customColumnsDataProvider: this._customColumnsDataProvider,
            onGetLookupManyHandler: columnName => this._getLookupManyHandlerForColumn(columnName),
        };
        return await this._params.onRecordSave?.(params)
            ?? DataverseTaskActions.saveRecord(params);
    }

    public onIsRecordActive(recordId: string): boolean {
        const params: IDataverseTaskActivityParams = {
            //the grid only asks about rows it holds, so the record is always there
            record: this._provider.getRecordsMap()[recordId],
            nativeColumns: this._provider.getNativeColumns(),
        };
        return this._params.onIsRecordActive?.(params) ?? DataverseTaskActions.isRecordActive(params);
    }

    /** Returns the root task ID used to scope the displayed hierarchy. */
    public onGetRootTaskId?(): string | undefined {
        return this._rootTaskId;
    }

    private _getLookupManyHandlerForColumn(colName: string): LookupManyHandler {
        const handler = this._lookupManyHandlers[colName];
        if (!handler) {
            throw new Error(`No LookupManyHandler found for column ${colName}`);
        }
        return handler;
    }

}