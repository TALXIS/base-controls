import { DataProvider, FetchXmlDataProvider, IColumn, IDataProvider, IFetchXmlDataProvider, IRecordSaveOperationResult, ISavedQuery } from "@talxis/client-libraries";
import { IDatasetControl } from "../DatasetControl";
import { ViewSwitcherBase } from "../../view-switcher";


export class DatasetControlViewSwitcher extends ViewSwitcherBase {
    private _datasetControl: IDatasetControl;
    private _provider: IDataProvider;
    private _queriesLoadedPromise: Promise<void>;
    private _resolveQueriesLoadedPromise: () => void = () => { };

    constructor(datasetControl: IDatasetControl) {
        super();
        this._datasetControl = datasetControl;
        this._provider = this._datasetControl.getDataset().getDataProvider();
        this._queriesLoadedPromise = new Promise((resolve) => {
            this._resolveQueriesLoadedPromise = resolve;
        });
        this._provider.addEventListener('onPreloadFinished', () => this._resolveQueriesLoadedPromise());
    }

    public onGetSystemQueries(): ISavedQuery[] {
        return this._provider.getSavedQueries().filter(query => !query.isUserQuery);
    }
    public onGetUserQueries(): ISavedQuery[] {
        return this._provider.getSavedQueries().filter(query => query.isUserQuery);
    }

    public onAreQueriesLoaded(): Promise<void> {
        return this._provider.getSavedQueries().length === 0 ? this._queriesLoadedPromise : Promise.resolve();
    }

    public onGetCurrentSavedQuery(): ISavedQuery {
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
    public async onSaveNewUserQuery(data: { name: string; description?: string }): Promise<string> {
        const { name, description } = data;
        const response = await window.Xrm.WebApi.createRecord(DataProvider.CONST.USER_QUERY_TABLE_NAME, {
            'talxis_name': name,
            'talxis_description': description ?? null,
            'talxis_returnedtypecode': this._provider.getEntityName(),
            'talxis_layoutjson': JSON.stringify(this._provider.getColumns().map(column => this._getColumnWithStrippedMetadata(column))),
            'talxis_recordid': this._datasetControl.getUserQueryScope(),
            'talxis_isdefault': this.getUserQueries().length === 0,
            'talxis_fetchxml': this._provider.getFetchXml()
        });
        return response.id;
    }

    public async onUpdateCurrentUserQuery(): Promise<void> {
        const currentQuery = this.getCurrentSavedQuery();
        await window.Xrm.WebApi.updateRecord(DataProvider.CONST.USER_QUERY_TABLE_NAME, currentQuery.id, {
            'talxis_layoutjson': JSON.stringify(this._provider.getColumns().map(column => this._getColumnWithStrippedMetadata(column))),
            'talxis_fetchxml': this._provider.getFetchXml()
        });
    }
        public onSetCurrentSavedQuery(queryId: string): void {
        throw new Error("Method not implemented.");
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