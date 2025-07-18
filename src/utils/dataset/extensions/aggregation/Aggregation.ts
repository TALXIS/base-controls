import { AggregationFunction, EventEmitter, IAggregationMetadata, IDataset, IRecord, MemoryDataProvider } from "@talxis/client-libraries";

interface ITranslations {
    calculationLimitExceededError: string;
}

interface IDependencies {
    onGetDataset: () => IDataset;
    translations: ITranslations;
}

interface IEvents {
    onRequestRender: () => void;
    onRequestMainDatasetRefresh: () => void;
}

export class Aggregation extends EventEmitter<IEvents> {
    private _hasUserChangedAggregations: boolean = false;
    private _aggregationDataset: IDataset;
    private _translations: ITranslations;
    private _onGetDataset: () => IDataset;

    constructor({ onGetDataset, translations }: IDependencies) {
        super();
        this._onGetDataset = onGetDataset;
        this._translations = translations;
        //this._aggregationDataset = this._dataset.getChildDataset();
        //this._aggregationDataset.addEventListener('onBeforeNewDataLoaded', () => this._syncAggregationDataProvider());
        //this._aggregationDataset.addEventListener('onError', (errorMessage, details) => this._onError(errorMessage, details));
        //this._aggregationDataset.addEventListener('onNewDataLoaded', () => this._dataset.getDataProvider().setError(false));
        //this._aggregationDataset.addEventListener('onLoading', () => this.dispatchEvent('onRequestRender'));
        //this._dataset.addEventListener('onNewDataLoaded', () => this._updateAggregations());
    }
    public getAggregationRecord(): IRecord[] {
        if (this._aggregationDataset.aggregation.getAggregations().length === 0 || this._dataset.sortedRecordIds.length === 0) {
            return [];
        }
        if (this._aggregationDataset.loading) {
            return [this._getDummyLoadingRecord()];
        }
        return this._aggregationDataset.getDataProvider().getRecords();
    }

    public addAggregation(columnName: string, aggregationFunction: AggregationFunction) {
        if (this._dataset.grouping.getGroupBys().length > 0) {
            this._dataset.aggregation.addAggregation({
                columnName: columnName,
                alias: `${columnName}_${aggregationFunction}`,
                aggregationFunction: aggregationFunction,
            })
            this.dispatchEvent('onRequestMainDatasetRefresh');
        }
        this._aggregationDataset.aggregation.addAggregation({
            columnName: columnName,
            alias: `${columnName}_${aggregationFunction}`,
            aggregationFunction: aggregationFunction,
        })
        this._hasUserChangedAggregations = true;
        this._aggregationDataset.refresh();
    }

    public removeAggregation(columnName: string) {
        if (this._dataset.aggregation.getAggregations().length > 0) {
            this._dataset.aggregation.removeAggregation(columnName);
            this.dispatchEvent('onRequestMainDatasetRefresh');
        }
        const aggregation = this.getAggregationForColumn(columnName);
        if (aggregation) {
            this._aggregationDataset.aggregation.removeAggregation(columnName);
        }
        this._hasUserChangedAggregations = true;
        this._aggregationDataset.refresh();
    }

    public isAggregationAppliedToColumn(columnName: string, aggregationFunction?: string): boolean {
        if (this._dataset.aggregation.getAggregation(columnName)?.aggregationFunction === aggregationFunction) {
            return true;
        }
        return !!this._aggregationDataset.aggregation.getAggregations().find(agg => {
            if (agg.columnName === columnName) {
                if (aggregationFunction) {
                    return agg.aggregationFunction === aggregationFunction;
                }
                return true;
            }
        })
    }

    public getAggregationForColumn(columnName: string) {
        return this._aggregationDataset.aggregation.getAggregations().find(agg => {
            return agg.columnName === columnName;
        });
    }

    private _updateAggregations() {
        this._syncAggregationDataProvider();
        if (!this._hasUserChangedAggregations) {
            this._getAggregationsFromColumns().map(aggregation => {
                this._aggregationDataset.aggregation.addAggregation(aggregation);
            })
        }
        const aggregations = this._aggregationDataset.aggregation.getAggregations();
        const columnNames = this._dataset.getDataProvider().getColumns().map(col => col.name);
        aggregations.map(agg => {
            if (!columnNames.includes(agg.columnName)) {
                this._aggregationDataset.aggregation.removeAggregation(agg.columnName);
            }
        })
        if (this._aggregationDataset.aggregation.getAggregations().length > 0) {
            this._aggregationDataset.refresh();
        }
    }

    private _getAggregationsFromColumns(): IAggregationMetadata[] {
        const aggregations: IAggregationMetadata[] = [];
        this._dataset.columns.map(col => {
            if (col.aggregationFunction) {
                aggregations.push({
                    columnName: col.name,
                    alias: `${col.name}_${col.aggregationFunction}`,
                    aggregationFunction: col.aggregationFunction,
                })
            }
        })
        return aggregations;
    }

    private _getDummyLoadingRecord(): IRecord {
        const data: { [key: string]: any } = {};
        data.id = 'loading';
        this._dataset.columns.map(col => {
            data[col.name] = null;
        })
        const provider = new MemoryDataProvider([data], { PrimaryIdAttribute: "id" });
        provider.setColumns(this._dataset.columns);
        provider.refreshSync();
        const dummyRecord = provider.getRecords()[0];
        this._dataset.columns.map(col => {
            dummyRecord.expressions.ui.setLoadingExpression(col.name, () => true);
        });
        return dummyRecord;
    }

    private _onError(errorMessage: string, details?: any) {
        let errorText = errorMessage;
        const errorCode = details?.errorCode;
        if (errorCode === 2147750198 || errorCode === -2147164125) {
            errorText = this._translations.calculationLimitExceededError;
        }
        this._dataset.getDataProvider().setError(true, errorText);
        this.dispatchEvent('onRequestRender')
    }

    private _syncAggregationDataProvider() {
        this._aggregationDataset.grouping.clear();
        this._aggregationDataset.getDataProvider().setLinking(this._dataset.getDataProvider().getLinking());
        this._aggregationDataset.getDataProvider().setFiltering(this._dataset.getDataProvider().getFiltering());
        this._aggregationDataset.getDataProvider().setSearchQuery(this._dataset.getDataProvider().getSearchQuery());
        this._aggregationDataset.getDataProvider().setDataSource(this._dataset.getDataProvider().getDataSource())
        this._aggregationDataset.getDataProvider().setColumns(this._dataset.getDataProvider().getColumns().map(col => {
            return {
                ...col,
                isGrouped: false,
                metadata: {
                    ...col.metadata,
                    RequiredLevel: 0
                }
            }
        }))
    }
    private get _dataset() {
        return this._onGetDataset();
    }
}