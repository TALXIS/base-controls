import { Dataset } from "@talxis/client-libraries";
import { DatasetControl, IDatasetControl } from "../../../../utils/dataset-control";

export class ViewManager {
    private _mainDatasetControl: IDatasetControl;
    private _datasetControl: IDatasetControl;

    constructor(datasetControl: IDatasetControl) {
        this._mainDatasetControl = datasetControl;
        this._datasetControl = this._createDatasetControl()
    }
    public getDatasetControl(): IDatasetControl {
        return this._datasetControl;
    }

    private _createDatasetControl(): IDatasetControl {
        const dataset = new Dataset(this._mainDatasetControl.viewSwitcher.getUserQueriesProvider());
        dataset.setColumns([{
            name: 'talxis_name',
            visualSizeFactor: 100
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
                    }
                }
            }
        });
    }
}