import { FetchXmlBuilder, IDataProvider } from "@talxis/client-libraries";
import { IDeletedUserQueriesResult, ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy } from "../../providers";
import { IFieldMapping as IFieldMappingBase, ITaskGridDescriptor, ITaskGridParameters, ITaskStrategyDeps } from "../../interfaces";
import { IGridCustomizerStrategy } from "../../components/grid";
import { DataverseSavedQueryStrategy } from "./DataverseSavedQueryStrategy";
import { DataverseTaskStrategy } from "./DataverseTaskStrategy";
import { DataverseGridCustomizerStrategy } from "./DataverseGridCustomizerStrategy";

/** Minimal reference to a project record. Use `name` when already known to skip a metadata fetch. */
export interface IProjectReference extends Omit<ComponentFramework.EntityReference, 'name'> {
    /** Logical entity name of the project entity (e.g. `"talxis_project"`). */
    etn: string;
    /** Display name of the project record. When provided, the descriptor skips a `getEntityMetadata` call during `onLoadDependencies`. */
    name?: string;
}

/** Dataverse-specific field mapping. Extends the base with an optional project lookup column. */
export interface IFieldMapping extends Omit<IFieldMappingBase, 'stateCode'> {
    /** Logical name of the lookup attribute that points to the parent project record. Required when `project` is set on the descriptor. */
    projectId?: string;
}

/** Constructor parameters for {@link DataverseTaskGridDescriptor}. */
interface IDataverseTaskGridDescriptorParams {
    /** FetchXML that drives the initial data load. May use Liquid template variables (e.g. `{{ projectId }}`). */
    baseFetchXml: string;
    /** Maps logical entity attribute names to the roles expected by TaskGrid (e.g. `statecode` → `stateCode`). */
    fieldMapping: IFieldMapping;
    /** System (non-deletable) views exposed in the view switcher. At least one is required. */
    systemQueries: ISavedQuery[];
    /** Optional project record reference. When provided, new tasks are pre-linked to this project and `baseFetchXml` receives `{{ projectId }}`. */
    project?: IProjectReference;
    /** AG Grid Enterprise license key. Omit to run in community mode. */
    agGridLicenseKey?: string;
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
    private _fetchXml: string;
    private _fieldMapping: IFieldMapping;
    private _systemQueries: ISavedQuery[] = [];
    private _taskEntityName: string;
    private _editFormId?: string;
    private _createFormId?: string;
    private _bulkEditFormId?: string;
    private _userId?: string;
    private _rootTaskId?: string;
    private _projectReference?: ComponentFramework.EntityReference;
    private _params: IDataverseTaskGridDescriptorParams;
    private _gridParameters?: ITaskGridParameters;
    private _agGridLicenseKey?: string;

    /** @param params — see {@link IDataverseTaskGridDescriptorParams} for full documentation of each option. */
    constructor(params: IDataverseTaskGridDescriptorParams) {
        this._params = params;
        this._systemQueries = params.systemQueries;
        this._fieldMapping = params.fieldMapping;
        this._userId = params.userId;
        this._fetchXml = params.baseFetchXml;
        this._rootTaskId = params.rootTaskId;
        this._editFormId = params.editFormId;
        this._createFormId = params.createFormId;
        this._bulkEditFormId = params.bulkEditFormId;
        this._agGridLicenseKey = params.agGridLicenseKey;
        this._gridParameters = params.gridParameters;
        this._taskEntityName = this._getTaskEntityNameFromFetchXml(params.baseFetchXml);
    }

    /** Resolves the project entity reference (fetches display name when not supplied). Called once by the factory before any strategy is created. */
    public async onLoadDependencies(): Promise<void> {
        this._projectReference = await this._getProjectReference();
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

    /** Returns a {@link DataverseSavedQueryStrategy} when `enableUserQueries` is `true`, otherwise a read-only stub that exposes only the system queries. */
    public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
        if (this._gridParameters?.enableUserQueries) {
            return new DataverseSavedQueryStrategy({
                onGetSystemQueries: async () => this._systemQueries,
                ownerId: this._userId,
                entityName: this._taskEntityName,
                recordId: this._projectReference?.id.guid
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

    /** Returns a {@link DataverseTaskStrategy} configured with the descriptor's FetchXML, form IDs, and project reference. */
    public onCreateTaskStrategy(deps: ITaskStrategyDeps): ITaskDataProviderStrategy {
        return new DataverseTaskStrategy({
            fetchXml: this._fetchXml,
            projectReference: this._projectReference,
            rootTaskId: this._rootTaskId,
            bulkEditFormId: this._bulkEditFormId,
            createFormId: this._createFormId,
            editFormId: this._editFormId,
            isInlineCreateEnabled: this._gridParameters?.enableInlineCreation ?? true,
            isCascadeDeleteEnabled: this._params.enableCascadeDelete ?? false,
            isDeletingTasksWithChildrenEnabled: this._params.enableDeletingTasksWithChildren ?? false,
        });
    }
    /** Returns a {@link DataverseSavedQueryStrategy} pre-configured as a data provider for the user-query creation/update dialog, with `talxis_name` and `talxis_description` columns. */
    public onCreateUserQueryDataProvider(): IDataProvider {
        const provider = new DataverseSavedQueryStrategy({
            recordId: this._projectReference?.id.guid,
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

    /** Returns the AG Grid Enterprise license key supplied at construction time, or `undefined` for community mode. */
    public onGetAgGridLicenseKey() {
        return this._agGridLicenseKey;
    }

    /** Returns the feature flags supplied at construction time, or an empty object (all features enabled) when omitted. */
    public onGetGridParameters(): ITaskGridParameters {
        return this._gridParameters ?? {};
    }

    /** Returns a {@link DataverseGridCustomizerStrategy} that adds lookup-many cell renderers for columns whose name ends with the lookup-many suffix. */
    public onCreateGridCustomizerStrategy(): IGridCustomizerStrategy {
        return new DataverseGridCustomizerStrategy();
    }

    private async _getProjectReference(): Promise<ComponentFramework.EntityReference | undefined> {
        if (!this._params.project) return undefined;
        if (this._params.project.name) {
            return this._params.project as ComponentFramework.EntityReference;
        }
        else {
            const projectId = this._params.project.id.guid;
            const projectEntityName = this._params.project.etn;
            const metadata = await window.Xrm.Utility.getEntityMetadata(projectEntityName);
            const projectData = await window.Xrm.WebApi.retrieveRecord(projectEntityName, projectId, `?$select=${metadata.PrimaryNameAttribute}`);

            return {
                id: { guid: projectId },
                name: projectData[metadata.PrimaryNameAttribute],
                etn: projectEntityName
            }
        }
    }

    private _getTaskEntityNameFromFetchXml(fetchXml: string): string {
        const fetchXmlBuilder = FetchXmlBuilder.fetch.fromXml(fetchXml);
        return fetchXmlBuilder.entity.name;
    }

}