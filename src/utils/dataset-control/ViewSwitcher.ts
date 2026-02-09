import { IDataProvider, ISavedQuery } from "@talxis/client-libraries";
import { IDatasetControl } from "./DatasetControl";

export interface IViewSwitcher {
    getSystemQueries(): ISavedQuery[];
    getUserQueries(): ISavedQuery[];
    setCurrentSavedQuery(queryId: string): void;
    getCurrentSavedQuery(): ISavedQuery;
}

export class ViewSwitcher implements IViewSwitcher {
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

    public setCurrentSavedQuery(queryId: string) {
        const oldQueryId = this._provider.getViewId();
        this._datasetControl.requestRemount({
            reason: 'saved-query-changed',
            data: {
                oldQueryId: oldQueryId,
                newQueryId: queryId
            }
        });
    }
    public getCurrentSavedQuery(): ISavedQuery {
        const query = this._provider.getSavedQueries().find(query => query.id === this._provider.getViewId());
        if(!query) {
            throw new Error('Current saved query not found');
        }
        return query;
    }
}