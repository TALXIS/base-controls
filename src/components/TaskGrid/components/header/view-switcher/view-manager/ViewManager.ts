import { Dataset, DataTypes, ICommand, IDataset, IRetrieveRecordCommandOptions, MemoryDataProvider } from "@talxis/client-libraries";
import { DatasetControl, IDatasetControl } from "@utils/dataset-control";
import { ITaskGridDatasetControl } from "@components/TaskGrid/interfaces";
import { ILocalizationService } from "@utils";
import { ITaskGridLabels } from "@components/TaskGrid/labels";
import { IDeletedUserQueriesResult, ISavedQueryDataProvider } from "@components/TaskGrid/providers/saved-query";
import { ErrorHelper } from "@utils";

//the manager's grid runs on a synthetic entity projected from the views the grid already loaded
const ID_ATTRIBUTE = 'queryid';
const NAME_ATTRIBUTE = 'name';
const DESCRIPTION_ATTRIBUTE = 'description';

export class ViewManager {
    private _taskGridDatasetControl: ITaskGridDatasetControl;
    private _localizationService: ILocalizationService<ITaskGridLabels>;
    private _savedQueryDataProvider: ISavedQueryDataProvider;
    private _userQueryDataProvider: MemoryDataProvider;
    private _datasetControl: IDatasetControl;
    private _shouldRemountOnDismiss: boolean = false;


    constructor(taskGridDatasetControl: ITaskGridDatasetControl) {
        this._taskGridDatasetControl = taskGridDatasetControl
        this._localizationService = taskGridDatasetControl.getLocalizationService();
        this._savedQueryDataProvider = taskGridDatasetControl.getSavedQueryDataProvider();
        this._userQueryDataProvider = this._createUserQueryDataProvider();
        this._userQueryDataProvider.setInterceptor('onRetrieveRecordCommand', (parameters, defaultAction) => this._onRetrieveRecordCommand(parameters, defaultAction));
        const dataset = new Dataset(this._userQueryDataProvider);
        this._datasetControl = this._createDatasetControl(dataset);
        this._registerEventListeners();
    }

    public getDatasetControl() {
        return this._datasetControl;
    }

    public shouldRemountOnDismiss() {
        return this._shouldRemountOnDismiss;
    }

    //edits are persisted through the saved query provider, so nothing here knows about the backend
    private _createUserQueryDataProvider(): MemoryDataProvider {
        const provider = new MemoryDataProvider({
            dataSource: this._savedQueryDataProvider.getUserQueries().map(query => ({
                [ID_ATTRIBUTE]: query.id,
                [NAME_ATTRIBUTE]: query.name,
                [DESCRIPTION_ATTRIBUTE]: query.description ?? null,
            })),
            metadata: {
                PrimaryIdAttribute: ID_ATTRIBUTE,
                PrimaryNameAttribute: NAME_ATTRIBUTE,
                LogicalName: 'taskgrid_userquery',
                QuickFindColumns: [NAME_ATTRIBUTE],
            },
        });
        provider.setColumns([
            { name: ID_ATTRIBUTE, dataType: 'SingleLine.Text', isHidden: true },
            { name: NAME_ATTRIBUTE, dataType: 'SingleLine.Text', displayName: this._localizationService.getLocalizedString('name'), visualSizeFactor: 200 },
            { name: DESCRIPTION_ATTRIBUTE, dataType: DataTypes.Multiple, displayName: this._localizationService.getLocalizedString('description'), visualSizeFactor: 300 },
        ]);
        return provider;
    }

    private _createDatasetControl(dataset: IDataset): IDatasetControl {
        return new DatasetControl({
            controlId: 'viewManagerDatasetControl',
            onGetPcfContext: () => this._taskGridDatasetControl.getPcfContext(),
            state: {},
            onGetParameters: () => {
                return {
                    Grid: dataset,
                    EnableEditing: {
                        raw: true
                    },
                    EnableAutoSave: {
                        raw: true
                    },
                    EnableNavigation: {
                        raw: false
                    }
                }
            }
        });
    }

    private async _onRetrieveRecordCommand(parameters: IRetrieveRecordCommandOptions | undefined, defaultAction: (parameters: IRetrieveRecordCommandOptions | undefined) => Promise<ICommand[]>): Promise<ICommand[]> {
        const recordIds = parameters?.recordIds ?? [];
        return [
            ...await defaultAction(parameters),
            {
                canExecute: true,
                children: [],
                commandButtonId: 'deleteView',
                commandId: 'deleteViewCommand',
                controlType: 'Button',
                shouldBeVisible: recordIds.length > 0,
                icon: 'Delete',
                label: this._localizationService.getLocalizedString('deleteSelected'),
                tooltip: this._localizationService.getLocalizedString('deleteSelected'),
                execute: async () => {
                    const result = await this._datasetControl.getPcfContext().navigation.openConfirmDialog({
                        text: this._localizationService.getLocalizedString('confirmDialog.deleteSelectedRows.text')
                    })
                    if (result.confirmed) {
                        this._savedQueryDataProvider.deleteUserQueries(recordIds);
                    }
                }
            }

        ] as ICommand[]
    }

    private async _onAfterRecordSaved(recordId: string) {
        const record = this._userQueryDataProvider.getRecordsMap()[recordId];
        if (!record) {
            return;
        }
        //the stored query carries the columns, filters and sorting - only the details are edited here
        await this._savedQueryDataProvider.updateUserQuery({
            ...this._savedQueryDataProvider.getSavedQuery(recordId),
            name: record.getValue(NAME_ATTRIBUTE) as string,
            description: record.getValue(DESCRIPTION_ATTRIBUTE) as string ?? undefined,
        });
    }

    private _onAfterUserQueriesDeleted(result: IDeletedUserQueriesResult) {
        this._userQueryDataProvider.setLoading(false);
        if (!result.success) {
            this._datasetControl.getPcfContext().navigation.openConfirmDialog({
                subtitle: this._localizationService.getLocalizedString('deletingUserQueriesError'),
                text: result.errors.map(e => {
                    return `${this._userQueryDataProvider.getRecordsMap()[e.queryId].getNamedReference().name}: ${ErrorHelper.getMessageFromError(e.error)}`
                }).join('\n'),
            })
        }
        else {
            //the projection is local: drop the rows from it, then refresh so the grid re-renders
            this._userQueryDataProvider.deleteRecords(result.deletedQueryIds);
            this._userQueryDataProvider.refresh();
        }
    }

    private _onBeforeUserQueriesDeleted(queryIds: string[]) {
        this._shouldRemountOnDismiss = true;
        this._userQueryDataProvider.setLoading(true);
    }

    private _registerEventListeners() {
        this._savedQueryDataProvider.queryEvents.addEventListener('onBeforeUserQueriesDeleted', (queryIds) => this._onBeforeUserQueriesDeleted(queryIds));
        this._savedQueryDataProvider.queryEvents.addEventListener('onAfterUserQueriesDeleted', (result) => this._onAfterUserQueriesDeleted(result));
        this._userQueryDataProvider.addEventListener('onBeforeRecordSaved', () => this._shouldRemountOnDismiss = true);
        this._userQueryDataProvider.addEventListener('onAfterRecordSaved', (result) => {
            if (result.success) {
                this._onAfterRecordSaved(result.recordId);
            }
        });
    }
}