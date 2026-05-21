import { FetchXmlBuilder, IDataProvider } from "@talxis/client-libraries";
import { IDeletedUserQueriesResult, ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy, TalxisSavedQueryStrategy } from "../../data-providers";
import { INativeColumns, ITaskGridDescriptor, ITaskGridParameters, ITaskStrategyDeps } from "../../interfaces";
import { IGridCustomizerStrategy } from "../../components/grid";
import { DataProviderStrategy } from "./DataProviderStrategy";
import { GridCustomizer } from "./GridCustomizer";

export interface IProjectReference extends Omit<ComponentFramework.EntityReference, 'name'> {
    etn: string;
    name?: string;
}

interface IDescriptorParams {
    baseFetchXml: string;
    //maps entity fields to TaskGrid expected fields (e.g. statecode -> stateCode)
    fieldMapping: INativeColumns;
    //system views to be used as saved queries in TaskGrid
    systemQueries: ISavedQuery[];
    project?: IProjectReference;
    agGridLicenseKey?: string;
    enableUserQueries?: boolean;
    gridParameters?: ITaskGridParameters;
    rootTaskId?: string;
    userId?: string;
    editFormId?: string;
    createFormId?: string;
    bulkEditFormId?: string;
}

export class Descriptor implements ITaskGridDescriptor {
    private _fetchXml: string;
    private _fieldMapping: INativeColumns;
    private _systemQueries: ISavedQuery[] = [];
    private _taskEntityName: string;
    private _editFormId?: string;
    private _createFormId?: string;
    private _bulkEditFormId?: string;
    private _userId?: string;
    private _rootTaskId?: string;
    private _projectReference?: ComponentFramework.EntityReference;
    private _params: IDescriptorParams;
    private _gridParameters?: ITaskGridParameters;
    private _agGridLicenseKey?: string;

    constructor(params: IDescriptorParams) {
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

    public async onLoadDependencies(): Promise<void> {
        this._projectReference = await this._getProjectReference();
    }

    public onGetNativeColumns(): INativeColumns {
        return this._fieldMapping;
    }

    public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
        if (this._gridParameters?.enableUserQueries) {
            return new TalxisSavedQueryStrategy({
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

    public onCreateTaskStrategy(deps: ITaskStrategyDeps): ITaskDataProviderStrategy {
        return new DataProviderStrategy({
            fetchXml: this._fetchXml,
            projectReference: this._projectReference,
            rootTaskId: this._rootTaskId,
            bulkEditFormId: this._bulkEditFormId,
            createFormId: this._createFormId,
            editFormId: this._editFormId,
            isInlineCreateEnabled: this._gridParameters?.enableInlineCreation ?? true,
        });
    }
    public onCreateUserQueryDataProvider(): IDataProvider {
        const provider = new TalxisSavedQueryStrategy({
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

    public onGetAgGridLicenseKey() {
        return this._agGridLicenseKey;
    }

    public onGetGridParameters(): ITaskGridParameters {
        return this._gridParameters ?? {};
    }

    public onCreateGridCustomizerStrategy(): IGridCustomizerStrategy {
        return new GridCustomizer();
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