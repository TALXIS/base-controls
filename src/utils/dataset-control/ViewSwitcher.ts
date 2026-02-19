import { DataProvider, FetchXmlDataProvider, IColumn, IDataProvider, IFetchXmlDataProvider, IRecordSaveOperationResult, ISavedQuery } from "@talxis/client-libraries";
import { IDatasetControl } from "./DatasetControl";

export interface IViewSwitcher {
    getSystemQueries(): ISavedQuery[];
    getUserQueries(): ISavedQuery[];
    createUserQueriesDataProvider(): IFetchXmlDataProvider;
    areUserQueriesEnabled(): boolean;
    setCurrentSavedQuery(queryId: string): void;
    getCurrentSavedQuery(): ISavedQuery;
    saveNewUserQuery(data: { name: string; description: string }): Promise<IRecordSaveOperationResult>;
    updateCurrentUserQuery(): Promise<IRecordSaveOperationResult>;
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
        this._datasetControl.requestRemount({
            reason: 'saved-query-changed',
            data: {
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
    public createUserQueriesDataProvider(): IFetchXmlDataProvider {
        return new FetchXmlDataProvider({
            dataSource: this._provider.getUserQueriesFetchXml()!
        })
    }
    public async saveNewUserQuery(data: { name: string; description?: string }): Promise<IRecordSaveOperationResult> {
        const { name, description } = data;
        try {
            const response = await window.Xrm.WebApi.createRecord(DataProvider.CONST.USER_QUERY_TABLE_NAME, {
                'talxis_name': name,
                'talxis_description': description ?? null,
                'talxis_returnedtypecode': this._provider.getEntityName(),
                'talxis_layoutjson': JSON.stringify(this._provider.getColumns().map(column => this._getColumnWithStrippedMetadata(column))),
                'talxis_recordid': this._datasetControl.getUserQueryScope(),
                'talxis_isdefault': this.getUserQueries().length === 0,
                'talxis_fetchxml': this._provider.getFetchXml()
            });
            this._datasetControl.requestRemount({
                reason: 'saved-query-added',
                data: {
                    newQueryId: response.id
                }
            })
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

    public async updateCurrentUserQuery(): Promise<IRecordSaveOperationResult> {
        const currentQuery = this.getCurrentSavedQuery();
        this._provider.setLoading(true);
        try {
            await window.Xrm.WebApi.updateRecord(DataProvider.CONST.USER_QUERY_TABLE_NAME, currentQuery.id, {
                'talxis_layoutjson': JSON.stringify(this._provider.getColumns().map(column => this._getColumnWithStrippedMetadata(column))),
                'talxis_fetchxml': this._provider.getFetchXml()
            });
            return {
                success: true,
                recordId: currentQuery.id,
                fields: ['talxis_layoutjson']
            }
        }
        catch(error) {
            return {
                success: false,
                recordId: currentQuery.id,
                fields: ['talxis_layoutjson'],
                errors: [{
                    message: (error as any).message
                }]
            }
        }
        finally {
            this._provider.setLoading(false);
        }
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