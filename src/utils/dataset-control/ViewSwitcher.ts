import { FetchXmlDataProvider, IDataProvider, IFetchXmlDataProvider, IRecordSaveOperationResult, ISavedQuery } from "@talxis/client-libraries";
import { IDatasetControl } from "./DatasetControl";

export interface IViewSwitcher {
    getSystemQueries(): ISavedQuery[];
    getUserQueries(): ISavedQuery[];
    getUserQueriesProvider(): IFetchXmlDataProvider;
    areUserQueriesEnabled(): boolean;
    setCurrentSavedQuery(queryId: string): void;
    getCurrentSavedQuery(): ISavedQuery;
    saveNewUserQuery(data: { name: string; description: string }): Promise<IRecordSaveOperationResult>;
}

export class ViewSwitcher implements IViewSwitcher {
    private _datasetControl: IDatasetControl;
    private _provider: IDataProvider;
    private _userQueriesProvider?: IFetchXmlDataProvider;

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
    public areUserQueriesEnabled() {
        return !!this._provider.getUserQueriesFetchXml();
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
        if (!query) {
            throw new Error('Current saved query not found');
        }
        return query;
    }
    public getUserQueriesProvider(): IFetchXmlDataProvider {
        if (!this._userQueriesProvider) {
            this._userQueriesProvider = new FetchXmlDataProvider(this._provider.getUserQueriesFetchXml()!)
        }
        return this._userQueriesProvider;
    }
    public async saveNewUserQuery(data: { name: string; description?: string }): Promise<IRecordSaveOperationResult> {
        const userQueryId = crypto.randomUUID();
        const {name, description} = data;
        const provider = this.getUserQueriesProvider();
        await provider.preload();
        const record = provider.newRecord({
            recordId: userQueryId,
            rawData: {
                'talxis_name': name,
                'talxis_description': description ?? null,
                'talxis_returnedtypecode': this._provider.getEntityName(),
            },
        });
        const result = await record.save();
        if(result.success) {
            this.setCurrentSavedQuery(userQueryId);
        }
        return result;
    }
}


/* const userqueryid = `00001111${crypto.randomUUID().substring(8)}`;
        const { name, description } = data;
        const queryMetadata = this._getMetadataForSavedQuery();
        const rawData = {
            'talxis_userqueryid': userqueryid,
            'talxis_layoutjson': JSON.stringify(queryMetadata),
            'talxis_name': name,
            'talxis_description': description,
            'talxis_returnedtypecode': this.getEntityName(),
            'talxis_recordid': this._projectDataProvider.getProjectRecordSync().getRecordId(),
        }
        try {
            await window.Xrm.WebApi.createRecord('talxis_userquery', rawData);
            const record = this.newRecord({
                rawData: rawData,
                recordId: userqueryid
            });
            this._userQueryRecords.push(record);
            this._currentQueryRecord = record;
            return {
                success: true,
            }
        }
        catch (error: any) {
            return {
                success: false,
                errorMessage: error.message
            }
        } */