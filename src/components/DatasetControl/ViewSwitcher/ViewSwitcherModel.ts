import { IDataProvider, ISavedQuery } from "@talxis/client-libraries";
import { IDatasetControl } from "../../../utils/dataset-control";

export class ViewSwitcherModel {
    private _datasetControl: IDatasetControl;
    private _provider: IDataProvider;   
    constructor(datasetControl: IDatasetControl) {
        this._datasetControl = datasetControl;
        this._provider = this._datasetControl.getDataset().getDataProvider();
    }

    public getSystemQueries() {
        return this._provider.getSavedQueries().filter(query => !query.isUserQuery);
    }

    public getUserQueries() {
        return this._provider.getSavedQueries().filter(query => query.isUserQuery);
    }

    public getCurrentSavedQuery(): ISavedQuery {
        const view = this._provider.getSavedQueries().find(query => query.id === this._provider.getViewId());
        if(!view) {
            throw new Error('Current view not found among saved queries');
        }
        return view;
    }
}