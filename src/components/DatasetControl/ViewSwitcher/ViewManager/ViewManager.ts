import { Dataset, FetchXmlDataProvider, ICommand, IRecord, IRecordSaveOperationResult, IRetrieveRecordCommandOptions, Operators, Type } from "@talxis/client-libraries";
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
        const dataset = new Dataset(this._mainDatasetControl.viewSwitcher.createUserQueriesDataProvider());
        dataset.setInterceptor('onRetrieveRecordCommand', (options, defaultAction) => this._onRetrieveRecordCommand(options, defaultAction));
        dataset.setInterceptor('onRecordSave', (options, defaultAction) => this._onRecordSave(options, defaultAction));
        dataset.addEventListener('onAfterRecordSaved', (result) => result.success && (this._haveChangesBeenMade = true));
        dataset.setColumns([{
            name: 'talxis_name',
            visualSizeFactor: 100
        }, {
            name: 'talxis_description',
            visualSizeFactor: 150
        }, {
            name: 'talxis_isdefault',
            visualSizeFactor: 80,
            oneClickEdit: true
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

    private async _onRecordSave(record: IRecord, defaultAction: (record: IRecord) => Promise<IRecordSaveOperationResult>): Promise<IRecordSaveOperationResult> {
        const dirtyDefaultField = record.getFields().filter(field => field.isDirty() && field.getColumn().name === 'talxis_isdefault')[0];
        if (dirtyDefaultField?.getValue() == '1') {
            try {
                this._datasetControl.getDataset().getDataProvider().setLoading(true);
                //get all records that are default except the current one and set them to not default
                const provider = this._mainDatasetControl.viewSwitcher.createUserQueriesDataProvider();
                provider.getPaging().setPageSize(5000);
                provider.setFiltering({
                    filterOperator: Type.And.Value,
                    conditions: [{
                        attributeName: 'talxis_isdefault',
                        conditionOperator: Operators.Equal.Value,
                        value: '1',
                    }]
                });
                const records = await provider.refresh();
                records.map(record => {
                    record.setValue('talxis_isdefault', false);
                });
                await provider.save();
                const result = await defaultAction(record);
                setTimeout(() => {
                    if (result.success) {
                        this._datasetControl.getDataset().refresh();
                    }
                }, 0);
                return result;
            }
            catch(error) {
                throw error;
            }
            finally {
                this._datasetControl.getDataset().getDataProvider().setLoading(false);
            }
        }
        else {
            return defaultAction(record);
        }
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