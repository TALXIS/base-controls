import { FetchXmlBuilder, IDataProvider, IRawRecord, IRecord, ISingleRecord, RecordBuilder } from "@talxis/client-libraries";
import { ICustomColumnsStrategy, IDeletedUserQueriesResult, ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy } from "../../providers";
import { IFieldMapping as IFieldMappingBase, ITaskGridDescriptor, ITaskGridParameters, ITaskStrategyDeps } from "../../interfaces";
import { IGridCustomizerStrategy } from "../../components/grid";
import { DataverseSavedQueryStrategy } from "./DataverseSavedQueryStrategy";
import { DataverseTaskStrategy } from "./DataverseTaskStrategy";
import { DataverseGridCustomizerStrategy } from "./DataverseGridCustomizerStrategy";
import { EntityDefinition } from "@talxis/client-metadata";
import { DataverseCustomColumnsStrategy } from "./DataverseCustomColumnsStrategy";


/** Dataverse-specific field mapping. Extends the base with an optional project lookup column. */
export interface IFieldMapping extends Omit<IFieldMappingBase, 'stateCode'> {
    /** Logical name of the lookup attribute that points to the parent project record. Required when `projectRecord` is set on the descriptor. */
    projectId?: string;
}

/** Lightweight entity reference shape used when only logical name + id are available. */
export interface IEntityRecordReference {
    entityName: string;
    id: string;
}

/** Input accepted for source/project: either a fully hydrated record or an entity reference. */
export type RecordInput = IEntityRecordReference | ISingleRecord;

const isSingleRecord = (record: RecordInput | undefined): record is ISingleRecord => {
    return !!record && typeof (record as ISingleRecord).getRecordId === "function";
};

/** Constructor parameters for {@link DataverseTaskGridDescriptor}. */
export interface IDataverseTaskGridDescriptorParams {
    /** FetchXML that drives the initial data load. May use Liquid template variables (e.g. `{{ projectId }}`). */
    baseFetchXml: string;
    /** Maps logical entity attribute names to the roles expected by TaskGrid (e.g. `statecode` → `stateCode`). */
    fieldMapping: IFieldMapping;
    /** System (non-deletable) views exposed in the view switcher. At least one is required. */
    systemQueries: ISavedQuery[];
    /** Optional source record. If provided, it's data will be propagated into liquid fetch XML templates. */
    sourceRecord?: RecordInput;

    projectRecord?: RecordInput;

    height?: string;
    /** Set to `true` to enable personal saved views (user queries) via {@link DataverseSavedQueryStrategy}. Defaults to `false`. */
    enableUserQueries?: boolean;
    /** Fine-grained feature flags forwarded to the grid. See {@link ITaskGridParameters}. */
    gridParameters?: ITaskGridParameters;
    /** When set, the hierarchy is rooted at this task ID instead of showing all top-level tasks. */
    rootTaskId?: string;
    /** ID of the currently logged-in user. Used to scope user queries to the current owner. */
    userId?: string;
    /** Form ID to open when editing a single existing task. */
    editFormId?: string;
    /** Form ID to open when creating a new task via the dialog flow (non-inline). */
    createFormId?: string;
    /** Form ID to open for bulk-editing multiple selected tasks. */
    bulkEditFormId?: string;
    /** Set to `true` to enable cascade delete when deleting tasks with children. Defaults to `false`. */
    enableCascadeDelete?: boolean;
    /** Set to `true` to allow deletion of tasks that have child tasks. When `false`, such tasks are excluded from deletion and an error is returned. Defaults to `false`. */
    enableDeletingTasksWithChildren?: boolean;
}

/**
 * Ready-to-use {@link ITaskGridDescriptor} implementation for the Dataverse / Talxis platform.
 *
 * Wires together all required strategies — task CRUD, saved queries, grid customization — from
 * a single constructor parameter object. Pass an instance to `TaskGridDatasetControlFactory.createInstance`.
 *
 * @example
 * ```ts
 * const descriptor = new DataverseTaskGridDescriptor({
 *   baseFetchXml: myFetchXml,
 *   fieldMapping: { parentId: 'talxis_parenttaskid', subject: 'subject', stackRank: 'talxis_stackrank' },
 *   systemQueries: [myDefaultView],
 * });
 * const control = await TaskGridDatasetControlFactory.createInstance({ taskGridDescriptor: descriptor, ... });
 * ```
 */
export class DataverseTaskGridDescriptor implements ITaskGridDescriptor {
    private _fetchXml!: string;
    private _fieldMapping!: IFieldMapping;
    private _systemQueries: ISavedQuery[] = [];
    private _taskEntityName!: string;
    private _editFormId?: string;
    private _createFormId?: string;
    private _bulkEditFormId?: string;
    private _userId?: string;
    private _rootTaskId?: string;
    private _projectRecord?: ISingleRecord;
    private _sourceRecord?: ISingleRecord;
    private _params!: IDataverseTaskGridDescriptorParams;
    private _gridParameters?: ITaskGridParameters;
    private _height?: string;
    private _onInitialize: () => Promise<IDataverseTaskGridDescriptorParams>;

    /** @param params — see {@link IDataverseTaskGridDescriptorParams} for full documentation of each option. */
    constructor(params: { onInitialize: () => Promise<IDataverseTaskGridDescriptorParams>; height?: string }) {
        this._onInitialize = params.onInitialize;
        this._height = params.height;
    }

    /** Resolves the project entity reference (fetches display name when not supplied). Called once by the factory before any strategy is created. */
    public async onLoadDependencies(): Promise<void> {
        const params = await this._onInitialize();
        this._params = params;
        this._systemQueries = params.systemQueries;
        this._fieldMapping = params.fieldMapping;
        this._userId = params.userId;
        this._fetchXml = params.baseFetchXml;
        this._rootTaskId = params.rootTaskId;
        this._editFormId = params.editFormId;
        this._createFormId = params.createFormId;
        this._bulkEditFormId = params.bulkEditFormId;
        this._gridParameters = params.gridParameters;
        this._taskEntityName = this._getTaskEntityNameFromFetchXml(params.baseFetchXml);
        this._projectRecord = await this._getProjectRecord();
        this._sourceRecord = await this._getSourceRecord();
    }

    /** Returns the field mapping with `stateCode` hard-coded to `"statecode"` (standard Dataverse attribute name). */
    public onGetFieldMapping(): IFieldMappingBase {
        this
        return {
            ...this._fieldMapping,
            //dataverse uses this for all entities
            stateCode: 'statecode',
        }
    }

    //needs to be seperate from onGetGridParameters since it is also required for skeleton rendering before the instance is created
    public onGetHeight(): string | undefined {
        return this._height;
    }

    /** Returns a {@link DataverseSavedQueryStrategy} when `enableUserQueries` is `true`, otherwise a read-only stub that exposes only the system queries. */
    public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
        if (this._gridParameters?.enableUserQueries !== false) {
            return new DataverseSavedQueryStrategy({
                onGetSystemQueries: async () => this._systemQueries,
                ownerId: this._userId,
                entityName: this._taskEntityName,
                recordId: this._projectRecord?.getRecordId()
            });
        }
        return {
            onGetSystemQueries: async () => this._systemQueries,
            onGetUserQueries: async () => [],
            onDeleteUserQueries: function (queryIds: string[]): Promise<IDeletedUserQueriesResult> {
                throw new Error("Function not implemented.");
            },
            onUpdateUserQuery: function (currentQuery: ISavedQuery): Promise<string | null> {
                throw new Error("Function not implemented.");
            },
            onCreateUserQuery: function (newQuery: { name: string; description?: string; }, currentQuery: ISavedQuery): Promise<string | null> {
                throw new Error("Function not implemented.");
            }
        }
    }

    public onCreateCustomColumnsStrategy(): ICustomColumnsStrategy | undefined {
        return new DataverseCustomColumnsStrategy({
            entityName: this._taskEntityName,
            recordId: this._projectRecord?.getRecordId(),
        })
    }

    /** Returns a {@link DataverseTaskStrategy} configured with the descriptor's FetchXML, form IDs, and project reference. */
    public onCreateTaskStrategy(deps: ITaskStrategyDeps): ITaskDataProviderStrategy {
        return new DataverseTaskStrategy({
            fetchXml: this._fetchXml,
            projectRecord: this._projectRecord,
            sourceRecord: this._sourceRecord,
            rootTaskId: this._rootTaskId,
            bulkEditFormId: this._bulkEditFormId,
            createFormId: this._createFormId,
            editFormId: this._editFormId,
            isCascadeDeleteEnabled: this._params.enableCascadeDelete ?? false,
            isDeletingTasksWithChildrenEnabled: this._params.enableDeletingTasksWithChildren ?? false,
        }, deps);
    }
    /** Returns a {@link DataverseSavedQueryStrategy} pre-configured as a data provider for the user-query creation/update dialog, with `talxis_name` and `talxis_description` columns. */
    public onCreateUserQueryDataProvider(): IDataProvider {
        const provider = new DataverseSavedQueryStrategy({
            recordId: this._projectRecord?.getRecordId(),
            entityName: this._taskEntityName,
            ownerId: this._userId,
            onGetSystemQueries: async () => {
                return []
            }
        })
        provider.setColumns([{
            name: 'talxis_name',
            visualSizeFactor: 200
        }, {
            name: 'talxis_description',
            visualSizeFactor: 300
        }]);
        return provider;
    }

    /** Returns the feature flags supplied at construction time, or an empty object (all features enabled) when omitted. */
    public onGetGridParameters(): ITaskGridParameters {
        return this._gridParameters ?? {};
    }

    /** Returns a {@link DataverseGridCustomizerStrategy} that adds lookup-many cell renderers for columns whose name ends with the lookup-many suffix. */
    public onCreateGridCustomizerStrategy(): IGridCustomizerStrategy {
        return new DataverseGridCustomizerStrategy();
    }

    private async _getProjectRecord(): Promise<ISingleRecord | undefined> {
        const projectRecord = this._params.projectRecord;
        if (!projectRecord) return undefined;
        if (isSingleRecord(projectRecord)) {
            return projectRecord;
        }

        const projectId = projectRecord.id;
        const projectEntityName = projectRecord.entityName;
        const metadata = await EntityDefinition.fromEntityName(projectEntityName);
        //@ts-ignore - typings
        const attributes = (await window.Xrm.Utility.getEntityMetadata(projectEntityName, metadata.Attributes.map(attr => attr.LogicalName))).Attributes.get().filter(attr => attr.IsValidForGrid);
        const projectData = await window.Xrm.WebApi.retrieveRecord(projectEntityName, projectId, `?$select=${metadata.PrimaryNameAttribute}`);
        const builder = new RecordBuilder({
            data: projectData,
            entityMetadata: metadata,
            attributes: attributes
        });
        return builder.getRecord();
    }

    private async _getSourceRecord(): Promise<ISingleRecord | undefined> {
        const sourceRecord = this._params.sourceRecord;
        if (!sourceRecord) {
            return undefined;
        }
        const sourceRecordId = isSingleRecord(sourceRecord) ? sourceRecord.getRecordId() : sourceRecord.id;
        if (this._projectRecord && this._projectRecord.getRecordId() === sourceRecordId) {
            return this._projectRecord;
        }

        if (isSingleRecord(sourceRecord)) {
            return sourceRecord;
        }
        const result = await window.Xrm.WebApi.retrieveRecord(sourceRecord.entityName, sourceRecord.id);
        const entityMetadata = await EntityDefinition.fromEntityName(sourceRecord.entityName);
        //@ts-ignore - typings
        const attributes = (await window.Xrm.Utility.getEntityMetadata(sourceRecord.entityName, entityMetadata.Attributes.map(attr => attr.LogicalName))).Attributes.get().filter(attr => attr.IsValidForGrid);

        const builder = new RecordBuilder({
            data: result,
            entityMetadata: entityMetadata,
            attributes: attributes
        });

        return builder.getRecord();
    }

    private _getTaskEntityNameFromFetchXml(fetchXml: string): string {
        const fetchXmlBuilder = FetchXmlBuilder.fetch.fromXml(fetchXml);
        return fetchXmlBuilder.entity.name;
    }

}