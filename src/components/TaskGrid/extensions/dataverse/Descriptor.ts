import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IDeletedUserQueriesResult, ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy, TalxisSavedQueryStrategy } from "../../data-providers";
import { INativeColumns, ITaskGridDescriptor, ITaskGridParameters, ITaskStrategyDeps } from "../../interfaces";
import { IGridCustomizerStrategy } from "../../components/grid";
import { DataProviderStrategy } from "./DataProviderStrategy";
import { GridCustomizer } from "./GridCustomizer";
import { ProjectDataProvider } from "./ProjectDataProvider";

const LICENSE_KEY = 'Using_this_{AG_Grid}_Enterprise_key_{AG-058326}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{Microsoft_Corporation}_is_granted_a_{Single_Application}_Developer_License_for_the_application_{Business_Applications_Group}_only_for_{1}_Front-End_JavaScript_developer___All_Front-End_JavaScript_developers_working_on_{Business_Applications_Group}_need_to_be_licensed___{Business_Applications_Group}_has_been_granted_a_Deployment_License_Add-on_for_{Unlimited}_Production_Environments___This_key_works_with_{AG_Grid}_Enterprise_versions_released_before_{12_December_2025}____[v3]_[01]_MTc2NTQ5NzYwMDAwMA==9839d161bdceea4a5157119f5ce2bf89';

interface IDescriptorParams {
    baseFetchXml: string;
    //maps entity fields to TaskGrid expected fields (e.g. statecode -> stateCode)
    fieldMapping: INativeColumns;
    //system views to be used as saved queries in TaskGrid
    systemQueries: ISavedQuery[];
    agGridLicenseKey?: string;
    enableUserQueries?: boolean;
    gridParameters?: ITaskGridParameters;
    projectName?: string;
    projectId?: string;
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
    private _projectName?: string;
    private _projectId?: string;
    private _editFormId?: string;
    private _createFormId?: string;
    private _bulkEditFormId?: string;
    private _userId?: string;
    private _rootTaskId?: string;
    private _projectRecord?: IRecord;
    private _gridParameters?: ITaskGridParameters;
    private _agGridLicenseKey?: string;

    constructor(params: IDescriptorParams) {
        this._systemQueries = params.systemQueries;
        this._fieldMapping = params.fieldMapping;
        this._projectId = params.projectId;
        this._projectName = params.projectName;
        this._userId = params.userId;
        this._fetchXml = params.baseFetchXml;
        this._rootTaskId = params.rootTaskId;
        this._editFormId = params.editFormId;
        this._createFormId = params.createFormId;
        this._bulkEditFormId = params.bulkEditFormId;
        this._agGridLicenseKey = params.agGridLicenseKey;
        this._gridParameters = params.gridParameters;
    }   

    public async onLoadDependencies(): Promise<void> {
        await this._loadProject(this._projectName, this._projectId);
    }

    public onGetNativeColumns(): INativeColumns {
        return this._fieldMapping;
    }
    public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
        if (this._gridParameters?.enableUserQueries) {
            return new TalxisSavedQueryStrategy({
                onGetSystemQueries: async () => this._systemQueries,
                ownerId: this._userId,
                recordId: this._projectId
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
            projectRecord: this._projectRecord,
            rootTaskId: this._rootTaskId,
            bulkEditFormId: this._bulkEditFormId,
            createFormId: this._createFormId,
            editFormId: this._editFormId,
            isInlineCreateEnabled: this._gridParameters?.enableInlineCreation ?? true,
        });
    }
    public onCreateUserQueryDataProvider(): IDataProvider {
        const provider = new TalxisSavedQueryStrategy({
            recordId: this._projectId,
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

    private async _loadProject(projectEntityName?: string, projectId?: string) {
        if (projectEntityName && projectId) {
            const metadata = await window.Xrm.Utility.getEntityMetadata(projectEntityName);
            const projectProvider = new ProjectDataProvider({
                primaryIdAttributeName: metadata.PrimaryIdAttribute,
                primaryNameAttribute: metadata.PrimaryNameAttribute,
                projectEntityName: projectEntityName,
                projectId: projectId
            });
            await projectProvider.refresh();
            this._projectRecord = projectProvider.getProjectRecord();
        }
    }

}