import { Dataset, ICommand, IDataProvider, IDataset, IRetrieveRecordCommandOptions } from "@talxis/client-libraries";
import { DatasetControl, IDatasetControl } from "../../../../../../utils/dataset-control";
import { ITaskGridDatasetControl } from "../../../../interfaces";
import { ILocalizationService, ITaskGridLabels } from "../../../../labels";
import { IDeletedUserQueriesResult, ISavedQueryDataProvider } from "../../../../data-providers/saved-query-data-provider";
import { ErrorHelper } from "../../../../../../utils";

export class ViewManager {
    private _taskGridDatasetControl: ITaskGridDatasetControl;
    private _localizationService: ILocalizationService<ITaskGridLabels>;
    private _savedQueryDataProvider: ISavedQueryDataProvider;
    private _userQueryDataProvider: IDataProvider;
    private _datasetControl: IDatasetControl;
    private _shouldRemountOnDismiss: boolean = false;


    constructor(taskGridDatasetControl: ITaskGridDatasetControl) {
        this._taskGridDatasetControl = taskGridDatasetControl
        this._localizationService = taskGridDatasetControl.getLocalizationService();
        this._savedQueryDataProvider = taskGridDatasetControl.getSavedQueryDataProvider();
        this._userQueryDataProvider = taskGridDatasetControl.createUserQueryDataProvider();
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
    }
}