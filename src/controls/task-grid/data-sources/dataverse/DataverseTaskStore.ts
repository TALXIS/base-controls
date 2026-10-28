import { FetchXmlDataProvider, IAvailableColumnOptions, IAvailableRelatedColumn, IColumn, IMemoryProviderEntityMetadata, IRawRecord, IRecord, IRecordSaveOperationResult, Sanitizer } from "@talxis/client-libraries";
import { Liquid } from "liquidjs";
import { IDeleteTasksResult, IEditTasksResult, ITaskChanges, ITaskCreateResult, ITaskCreateParams, ITaskDataProvider, ITaskDeleteParams, ITaskLoadResult, ITaskMoveParams, ITaskStore } from "../../provider/interfaces";
import type { IPcfContext } from "@interfaces";
import type { ITaskRuntime } from "../../runtime";

/** A form the data source opens. */
export type DataverseTaskFormOperation = 'create' | 'edit' | 'bulkEdit' | 'open';

/** What `Xrm.Navigation.navigateTo` is called with to open a form. */
export interface IDataverseTaskFormParameters {
    pageInput: Xrm.Navigation.PageInputEntityRecord;
    navigationOptions?: Xrm.Navigation.NavigationOptions;
}

/** How the data source opens task forms. */
export interface IDataverseTaskFormOptions {
    createId?: string;
    editId?: string;
    bulkEditId?: string;
    /** Changes how a form opens. */
    onGetParameters?: (operation: DataverseTaskFormOperation, defaults: IDataverseTaskFormParameters) => IDataverseTaskFormParameters;
}

/** The record the grid sits on, such as the one the form shows. */
export interface IDataverseHostRecord {
    entityName: string;
    /** None while the record is unsaved. */
    id?: string;
    /** The record's columns, for the templates. */
    data?: IRawRecord;
}

export interface IDataverseTaskStoreParameters {
    taskRuntime: ITaskRuntime;
    /** Selects the tasks, rendered with Liquid over `project` and `hostRecord`. */
    fetchXml: string;
    /** The record the grid sits on, as `hostRecord` in the FetchXML. */
    hostRecord?: IDataverseHostRecord;
    form?: IDataverseTaskFormOptions;
    /** Values every new task starts with, by column. */
    onGetNewTaskDefaults?: (params: ITaskCreateParams) => IRawRecord | Promise<IRawRecord>;
}

const SIDE_DIALOG: Xrm.Navigation.NavigationOptions = { target: 2, width: { value: 80, unit: '%' }, position: 1 };

//the values land inside FetchXML attributes
const LIQUID = new Liquid({ outputEscape: 'escape' });
const MAX_IDS_PER_REQUEST = 800;

/** Tasks in Dataverse, read through FetchXML and opened in their forms. */
export class DataverseTaskStore implements ITaskStore {
    protected _parameters: IDataverseTaskStoreParameters;
    protected _taskRuntime: ITaskRuntime;
    protected _fetchXmlProvider!: FetchXmlDataProvider;
    protected _entityName!: string;
    protected _entitySetName!: string;
    protected _primaryIdAttribute!: string;
    protected _projectLookup?: { columnName: string; reference: ComponentFramework.EntityReference };

    constructor(parameters: IDataverseTaskStoreParameters) {
        this._parameters = parameters;
        this._taskRuntime = parameters.taskRuntime;
    }

    public async onLoad(provider: ITaskDataProvider): Promise<ITaskLoadResult> {
        const fetchXml = this._renderFetchXml();
        this._fetchXmlProvider = new FetchXmlDataProvider({ fetchXml, loadAllRecords: true });
        this._fetchXmlProvider.setColumns(provider.getColumns());
        this._fetchXmlProvider.setLinking(provider.getLinking());
        await this._fetchXmlProvider.refresh();
        const metadata = this._fetchXmlProvider.getMetadata();
        this._entityName = this._fetchXmlProvider.getEntityName();
        this._entitySetName = metadata.EntitySetName;
        this._primaryIdAttribute = metadata.PrimaryIdAttribute;
        const [projectLookup, webApiRawRecords] = await Promise.all([this._resolveProjectLookup(fetchXml), this._getRawRecords(this._fetchXmlProvider.getSortedRecordIds())]);
        this._projectLookup = projectLookup;
        const webApiRecords = new Map(webApiRawRecords.map(record => [record[this._primaryIdAttribute], record]));
        //the FetchXML values win
        const rawData = this._fetchXmlProvider.getRawData().map(record => ({ ...webApiRecords.get(record[this._primaryIdAttribute]), ...record }));
        return { rawData, metadata: metadata as IMemoryProviderEntityMetadata, columns: this._fetchXmlProvider.getColumns() };
    }

    public async onGetAvailableColumns(options?: IAvailableColumnOptions): Promise<IColumn[]> {
        return this._fetchXmlProvider.getAvailableColumns(options);
    }

    public async onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return this._fetchXmlProvider.getAvailableRelatedColumns();
    }

    public async onCreateTask(params: ITaskCreateParams): Promise<ITaskCreateResult | null> {
        const placement = this._getPlacement(params);
        const defaults = { ...await this._parameters.onGetNewTaskDefaults?.(params), ...params.data };
        const record = this._isEditingEnabled() ? await this._createThroughWebApi({ ...defaults, ...placement }) : await this._createThroughForm(defaults, placement);
        return record && { record };
    }

    public async onDeleteTasks(params: ITaskDeleteParams): Promise<IDeleteTasksResult | null> {
        const { results } = await this._fetchXmlProvider.deleteRecords(params.taskIds);
        const deletedTaskIds = results.filter(result => result.success).map(result => result.recordId);
        const errors = results.filter(result => !result.success).map(result => ({ id: result.recordId, error: result.errorMessage }));
        return errors.length === 0 ? { success: true, deletedTaskIds } : { success: false, deletedTaskIds, errors };
    }

    public async onMoveTask(params: ITaskMoveParams): Promise<ITaskChanges | null> {
        const fieldMapping = this._taskRuntime.getProvider().getFieldMapping();
        const parentId = params.parentRecord?.getRecordId();
        const parentNavigationProperty = await this._getNavigationPropertyName(this._entityName, fieldMapping.parentId);
        const taskId = params.movingRecord.getRecordId();
        await this._getPcfContext().webAPI.updateRecord(this._entityName, taskId, {
            [`${parentNavigationProperty}@odata.bind`]: parentId ? `/${this._entitySetName}(${parentId})` : null,
            [fieldMapping.stackRank]: params.stackRank,
        });
        return {};
    }

    public async onSaveRecord(record: IRecord): Promise<IRecordSaveOperationResult> {
        return this._fetchXmlProvider.onRecordSave(record);
    }

    public async onOpenRelatedRecord(reference: ComponentFramework.EntityReference): Promise<void> {
        await this._navigate('open', { pageInput: { pageType: 'entityrecord', entityName: reference.etn!, entityId: reference.id.guid }, navigationOptions: SIDE_DIALOG });
    }

    public async onEditTasks(taskIds: string[]): Promise<IEditTasksResult | null> {
        if (taskIds.length === 1) {
            await this._navigate('edit', {
                pageInput: { pageType: 'entityrecord', entityName: this._entityName, entityId: taskIds[0], formId: this._parameters.form?.editId, data: { isEditingEnabled: this._isEditingEnabled() && this._taskRuntime.getProvider().isRecordActive(taskIds[0]) } },
                navigationOptions: SIDE_DIALOG,
            });
        }
        else {
            await this._navigate('bulkEdit', {
                //Power Apps opens bulk edit for an id array
                pageInput: { pageType: 'bulkedit', entityName: this._entityName, entityIds: taskIds, formId: this._parameters.form?.bulkEditId } as unknown as Xrm.Navigation.PageInputEntityRecord,
                navigationOptions: { target: 2, position: 2 },
            });
        }
        return { success: true, updatedRecords: await this._getRawRecords(taskIds) };
    }

    protected _getPcfContext(): IPcfContext {
        return this._taskRuntime.services.get('pcfContext');
    }

    protected _isEditingEnabled(): boolean {
        return this._taskRuntime.isEditingEnabled();
    }

    protected _renderFetchXml(): string {
        const project = this._taskRuntime.services.get('datasetControl').modules.find('project');
        const hostRecord = this._parameters.hostRecord;
        return LIQUID.parseAndRenderSync(this._parameters.fetchXml, {
            project: project && { id: project.getId(), name: project.getName(), entityName: project.getEntityName(), ...project.getData() as object },
            hostRecord: hostRecord && { id: hostRecord.id, entityName: hostRecord.entityName, ...hostRecord.data },
        });
    }

    //the task lookup to the project's table
    protected async _resolveProjectLookup(fetchXml: string): Promise<{ columnName: string; reference: ComponentFramework.EntityReference } | undefined> {
        const project = this._taskRuntime.services.get('datasetControl').modules.find('project');
        const projectEntityName = project?.getEntityName();
        if (!project || !projectEntityName) {
            return undefined;
        }
        const lookupColumnNames = (await this._getManyToOneRelationships(this._entityName))
            .filter(relationship => relationship.ReferencedEntity === projectEntityName)
            .map(relationship => relationship.ReferencingAttribute);
        const filteredColumnNames = this._getColumnsFilteredByValue(fetchXml, project.getId());
        const narrowedColumnNames = lookupColumnNames.filter(columnName => filteredColumnNames.includes(columnName));
        const columnNames = narrowedColumnNames.length > 0 ? narrowedColumnNames : lookupColumnNames;
        if (columnNames.length > 1) {
            throw new Error(this._taskRuntime.getLabels().getLocalizedString('projectLookupAmbiguous', { columns: columnNames.join(', ') }));
        }
        return columnNames[0] ? { columnName: columnNames[0], reference: { id: { guid: project.getId() }, name: project.getName() ?? '', etn: projectEntityName } } : undefined;
    }

    //the root entity's `eq` conditions on this value
    protected _getColumnsFilteredByValue(fetchXml: string, value: string): string[] {
        const entity = new DOMParser().parseFromString(fetchXml, 'text/xml').querySelector('fetch > entity');
        const conditions = Array.from(entity?.querySelectorAll('condition') ?? []);
        return conditions
            .filter(condition => !condition.closest('link-entity') && !condition.getAttribute('entityname') && condition.getAttribute('operator') === 'eq')
            .filter(condition => this._isSameId(condition.getAttribute('value') ?? condition.querySelector('value')?.textContent ?? '', value))
            .map(condition => condition.getAttribute('attribute')!);
    }

    protected _isSameId(first: string, second: string): boolean {
        const normalize = (id: string) => id.replace(/[{}]/g, '').trim().toLowerCase();
        return normalize(first) === normalize(second);
    }

    protected _getPlacement(params: ITaskCreateParams): IRawRecord {
        const fieldMapping = this._taskRuntime.getProvider().getFieldMapping();
        const placement: IRawRecord = { [fieldMapping.stackRank]: params.stackRank };
        if (params.parentRecord) {
            placement[fieldMapping.parentId] = params.parentRecord.getNamedReference();
        }
        if (this._projectLookup) {
            placement[this._projectLookup.columnName] = this._projectLookup.reference;
        }
        return placement;
    }

    protected async _createThroughWebApi(values: IRawRecord): Promise<IRawRecord | null> {
        const { id } = await this._getPcfContext().webAPI.createRecord(this._entityName, await this._toWebApiPayload(values));
        return (await this._getRawRecords([id]))[0] ?? null;
    }

    //the form has no field for the rank
    protected async _createThroughForm(defaults: IRawRecord, placement: IRawRecord): Promise<IRawRecord | null> {
        const result = await this._navigate('create', {
            pageInput: { pageType: 'entityrecord', entityName: this._entityName, formId: this._parameters.form?.createId, data: this._toFormPrefill({ ...defaults, ...placement }) },
            navigationOptions: SIDE_DIALOG,
        });
        const saved = result?.savedEntityReference?.[0];
        if (!saved) {
            return null;
        }
        const taskId = Sanitizer.Lookup.getEntityReference(saved).id.guid;
        await this._getPcfContext().webAPI.updateRecord(this._entityName, taskId, await this._toWebApiPayload(placement));
        return (await this._getRawRecords([taskId]))[0] ?? null;
    }

    protected async _navigate(operation: DataverseTaskFormOperation, defaults: IDataverseTaskFormParameters): Promise<any> {
        const { pageInput, navigationOptions } = this._parameters.form?.onGetParameters?.(operation, defaults) ?? defaults;
        //the PCF typings leave out navigateTo
        const navigation = this._getPcfContext().navigation as ComponentFramework.Navigation & Pick<Xrm.Navigation, 'navigateTo'>;
        return navigation.navigateTo(pageInput, navigationOptions);
    }

    //a lookup takes three keys in a create form's `data`
    protected _toFormPrefill(values: IRawRecord): IRawRecord {
        const data: IRawRecord = {};
        for (const [columnName, value] of Object.entries(values)) {
            const reference = this._getReference(value);
            if (reference) {
                Object.assign(data, { [columnName]: reference.id.guid, [`${columnName}name`]: reference.name, [`${columnName}type`]: reference.etn });
            }
            else {
                data[columnName] = value;
            }
        }
        return data;
    }

    protected async _toWebApiPayload(values: IRawRecord): Promise<IRawRecord> {
        const payload: IRawRecord = {};
        for (const [columnName, value] of Object.entries(values)) {
            const reference = this._getReference(value);
            if (reference) {
                const referencedEntitySetName = (await this._getPcfContext().utils.getEntityMetadata(reference.etn!, [])).EntitySetName;
                payload[`${await this._getNavigationPropertyName(reference.etn!, columnName)}@odata.bind`] = `/${referencedEntitySetName}(${reference.id.guid})`;
            }
            else {
                payload[columnName] = value;
            }
        }
        return payload;
    }

    //a lookup arrives bare or as the array a lookup column holds
    protected _getReference(value: any): ComponentFramework.EntityReference | null {
        const candidate = Array.isArray(value) ? value[0] : value;
        return candidate?.id?.guid && candidate?.etn ? candidate : null;
    }

    protected async _getRawRecords(taskIds: string[]): Promise<IRawRecord[]> {
        const batches: string[][] = [];
        for (let index = 0; index < taskIds.length; index += MAX_IDS_PER_REQUEST) {
            batches.push(taskIds.slice(index, index + MAX_IDS_PER_REQUEST));
        }
        const results = await Promise.all(batches.map(async batch => {
            const ids = batch.map(id => `'${id}'`).join(',');
            const { entities } = await this._getPcfContext().webAPI.retrieveMultipleRecords(this._entityName, `?$filter=Microsoft.Dynamics.CRM.In(PropertyName='${this._primaryIdAttribute}', PropertyValues=[${ids}])`);
            return entities;
        }));
        return results.flat();
    }

    protected async _getManyToOneRelationships(entityName: string): Promise<{ ReferencedEntity: string; ReferencingAttribute: string; ReferencingEntityNavigationPropertyName: string }[]> {
        const metadata: any = await this._getPcfContext().utils.getEntityMetadata(entityName);
        return metadata.ManyToOneRelationships.getAll();
    }

    protected async _getNavigationPropertyName(referencedEntityName: string, referencingAttribute: string): Promise<string> {
        const relationship = (await this._getManyToOneRelationships(this._entityName)).find(relationship => relationship.ReferencedEntity === referencedEntityName && relationship.ReferencingAttribute === referencingAttribute);
        if (!relationship) {
            throw new Error(`No many-to-one relationship from ${this._entityName}.${referencingAttribute} to ${referencedEntityName}.`);
        }
        return relationship.ReferencingEntityNavigationPropertyName;
    }
}
