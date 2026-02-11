import { DataProvider, FetchXmlDataProvider, IColumn, IDataProvider, IFetchXmlDataProvider, IRecordSaveOperationResult, ISavedQuery } from "@talxis/client-libraries";
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
        return new FetchXmlDataProvider(this._provider.getUserQueriesFetchXml()!)
    }
    public async saveNewUserQuery(data: { name: string; description?: string }): Promise<IRecordSaveOperationResult> {
        const { name, description } = data;
        try {
            const response = await window.Xrm.WebApi.createRecord(DataProvider.CONST.USER_QUERY_TABLE_NAME, {
                'talxis_name': name,
                'talxis_description': description ?? null,
                'talxis_returnedtypecode': this._provider.getEntityName(),
                'talxis_layoutjson': JSON.stringify(this._getLayout())
            });
            this.setCurrentSavedQuery(response.id);
            return {
                success: true,
                recordId: response.id,
                fields: []
            }
        }
        catch (error: any) {
            return {
                fields: [],
                recordId: '',
                success: false,
                errors: [{
                    message: error.message
                }]
            }
        }
    }

    private _getLayout() {
        const layout = {
            dataSource: this._provider.getDataSourceForUserQuery(),
            columns: this._provider.getColumns().map(column => this._getColumnWithStrippedMetadata(column))
        }
        return layout;
    }

    private _getColumnWithStrippedMetadata(column: IColumn): IColumn {
        const whiteListedMetadataKeys = ['IsValidForUpdate', 'IsGroupedOrAggregatedVirtualColumn', 'CanBeGrouped', 'SupportedAggregations', 'SupportedFilterConditionOperators', 'OptionSet', 'Targets'];
        return {
            ...column,
            metadata: (() => {
                const metadata = column.metadata || {};
                const strippedMetadata: any = {};
                for (const key of whiteListedMetadataKeys) {
                    if (metadata[key] != undefined) {
                        strippedMetadata[key] = metadata[key];
                    }
                }
                return strippedMetadata;
            })()
        }
    }
}