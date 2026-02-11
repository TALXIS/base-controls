import { Dataset, ICommand, IRetrieveRecordCommandOptions } from "@talxis/client-libraries";
import { DatasetControl, IDatasetControl } from "../../../../utils/dataset-control";

const VIEW_MANAGER_PREFIX = 'viewManager_';

export class ViewManager {
    private _mainDatasetControl: IDatasetControl;
    private _datasetControl: IDatasetControl;
    private _haveChangesBeenMade = false;

    constructor(datasetControl: IDatasetControl) {
        this._mainDatasetControl = datasetControl;
        this._datasetControl = this._createDatasetControl()
    }
    public getDatasetControl(): IDatasetControl {
        return this._datasetControl;
    }
    public haveChangesBeenMade(): boolean {
        return this._haveChangesBeenMade;
    }
    private _createDatasetControl(): IDatasetControl {
        const dataset = new Dataset(this._mainDatasetControl.viewSwitcher.getUserQueriesProvider());
        dataset.setInterceptor('onRetrieveRecordCommand', (options, defaultAction) => this._onRetrieveRecordCommand(options, defaultAction));
        dataset.addEventListener('onAfterRecordSaved', (result) => result.success && (this._haveChangesBeenMade = true));
        dataset.setColumns([{
            name: 'talxis_name',
            visualSizeFactor: 150
        }, {
            name: 'talxis_description',
            visualSizeFactor: 200
        }])
        return new DatasetControl({
            controlId: 'viewManagerDatasetControl',
            onGetPcfContext: () => this._mainDatasetControl.getPcfContext(),
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
                    },
                    Height: {
                        raw: '100%'
                    }
                }
            }
        });
    }
    private async _onRetrieveRecordCommand(options: IRetrieveRecordCommandOptions | undefined, defaultAction: (options?: IRetrieveRecordCommandOptions) => Promise<ICommand[]>): Promise<ICommand[]> {
        const commands = await defaultAction(options);
        const { recordIds = [] } = options || {};
        return [
            ...commands,
            {
                canExecute: true,
                children: [],
                commandButtonId: `${VIEW_MANAGER_PREFIX}deleteViewsButton`,
                commandId: `${VIEW_MANAGER_PREFIX}deleteViews`,
                controlType: 'button',
                shouldBeVisible: recordIds.length > 0,
                tooltip: '',
                icon: 'Delete',
                label: 'Delete',
                //TODO: the loading should be handled directly in provider
                execute: async () => {
                    this._haveChangesBeenMade = true;
                    const provider = this._datasetControl.getDataset().getDataProvider();
                    provider.setLoading(true);
                    try {
                        await provider.deleteRecords(recordIds);
                        await provider.refresh();
                    }
                    catch (error) {
                        throw error;
                    }
                    finally {
                        provider.setLoading(false);
                    }
                }
            } as ICommand
        ]
    }

}