import { AggregationFunction, EventEmitter, IDataProvider, IRecord, MemoryDataProvider } from "@talxis/client-libraries";
interface IDependencies {
    onGetDataProvider: () => IDataProvider;
}

interface IEvents {
    onStateUpdated: () => void;
}

export class Aggregation extends EventEmitter<IEvents> {
    private _aggregationDataProvider: IDataProvider;
    private _onGetDataProvider: () => IDataProvider;

    constructor({ onGetDataProvider }: IDependencies) {
        super();
        this._onGetDataProvider = onGetDataProvider;
        this._aggregationDataProvider = this._dataProvider.createChildDataProvider();
        this._aggregationDataProvider.enableAggregationWithoutGrouping(true);
        this._dataProvider.addEventListener('onNewDataLoaded', () => this.refresh());
        this._aggregationDataProvider.addEventListener('onLoading', () => this.dispatchEvent('onStateUpdated'));
        this._aggregationDataProvider.addEventListener('onError', () => this.dispatchEvent('onStateUpdated'));
        //run on init since the first onNewDataLoaded event will not be triggered
        //because initialization of the class happens after the first data is loaded
        this.refresh();
    }
    public getAggregationRecord(): IRecord[] {
        if (this._aggregationDataProvider.aggregation.getAggregations().length === 0 || this._dataProvider.getSortedRecordIds().length === 0) {
            return [];
        }
        if (this._aggregationDataProvider.isError()) {
            return [this._getDummyErrorRecord()];
        }
        if (this._aggregationDataProvider.isLoading()) {
            return [this._getDummyLoadingRecord()];
        }
        return this._aggregationDataProvider.getRecords();
    }

    public addAggregation(columnName: string, aggregationFunction: AggregationFunction) {
        this._dataProvider.aggregation.addAggregation({
            columnName: columnName,
            alias: `${columnName}_${aggregationFunction}`,
            aggregationFunction: aggregationFunction,
        })
    }

    public removeAggregation(alias: string) {
        this._dataProvider.aggregation.removeAggregation(alias);
    }

    public async refresh() {
        if (!this._isMainProviderAggregated()) {
            this._aggregationDataProvider.aggregation.clear();
            this.dispatchEvent('onStateUpdated');
            return;
        }
        this._aggregationDataProvider.setLinking(this._dataProvider.getLinking());
        this._aggregationDataProvider.setFiltering(this._dataProvider.getFiltering());
        this._aggregationDataProvider.setSearchQuery(this._dataProvider.getSearchQuery());
        this._aggregationDataProvider.setDataSource(this._dataProvider.getDataSource());
        this._aggregationDataProvider.setColumns(this._dataProvider.getColumns().map(col => {
            return {
                ...col,
                grouping: undefined,
                aggregation: col.aggregation
            }
        }));
        await this._aggregationDataProvider.refresh();
    }

    private _isMainProviderAggregated(): boolean {
        //we need to look at columns since agggregation object can be empty if case of aggregation without grouping
        return this._dataProvider.getColumns().some(col => col.aggregation?.aggregationFunction);
    }

    private _getDummyRecord(): IRecord {
        const data: { [key: string]: any } = {};
        data.id = 'dummy-id';
        this._dataProvider.getColumns().map(col => {
            data[col.name] = null;
        })
        const provider = new MemoryDataProvider([data], { PrimaryIdAttribute: "dummy-id" });
        provider.enableAggregationWithoutGrouping(true);
        provider.setColumns([...this._dataProvider.getColumns(), {
            name: 'id',
            dataType: 'SingleLine.Text',
        }]);
        provider.grouping.clear();
        provider.aggregation.clear();
        provider.aggregation.addAggregation({
            columnName: 'id',
            alias: 'id_count',
            aggregationFunction: 'count'
        })
        provider.refreshSync();
        const dummyRecord = provider.getRecords()[0];
        return dummyRecord;
    }

    private _getDummyLoadingRecord(): IRecord {
        const record = this._getDummyRecord();
        record.getDataProvider().getColumns().map(col => {
            record.expressions.ui.setLoadingExpression(col.name, () => true);
        })
        return record;
    }
    private _getDummyErrorRecord(): IRecord {
        const record = this._getDummyRecord();
        record.getDataProvider().setError(true, this._aggregationDataProvider.getErrorMessage());
        return record;
    }

    private get _dataProvider(): IDataProvider {
        return this._onGetDataProvider();
    }
}