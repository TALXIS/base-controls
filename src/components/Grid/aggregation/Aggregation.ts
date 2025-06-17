import { AggregationFunction, IAggregationMetadata, IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { GridDependency } from "../core/model/GridDependency";
import { Grid } from "../core/model/Grid";

export class Aggregation extends GridDependency {
    private _hasUserChangedAggregations: boolean = false;

    constructor(grid: Grid) {
        super(grid);
        this._dataset.addEventListener('onNewDataLoaded', () => this._updateAggregations());
        this._getAggregationDataProvider().addEventListener('onError', (errorMessage, details) => this._onError(errorMessage, details));
        this._getAggregationDataProvider().addEventListener('onNewDataLoaded', () => {
            this._dataset.getDataProvider().setError(false)
        })
        this._getAggregationDataProvider().addEventListener('onLoading', () => {
            this._pcfContext.factory.requestRender();
        })
    }
    public getAggregationRecord(): IRecord[] {
        if (this._getAggregationDataProvider().aggregation.getAggregations().length === 0) {
            return [];
        }
        if (this._getAggregationDataProvider().isLoading()) {
            return [this._getDummyLoadingRecord()];
        }
        return this._getAggregationDataProvider().getRecords();
    }

    public addAggregation(columnName: string, aggregationFunction: AggregationFunction) {
        this._getAggregationDataProvider().aggregation.addAggregation({
            columnName: columnName,
            alias: `${columnName}_${aggregationFunction}`,
            aggregationFunction: aggregationFunction,
        })
        this._hasUserChangedAggregations = true;
        this._getAggregationDataProvider().refresh();
    }

    public removeAggregation(columnName: string) {
        const aggregation = this.getAggregationForColumn(columnName);
        if (aggregation) {
            this._getAggregationDataProvider().aggregation.removeAggregation(aggregation);
        }
        this._hasUserChangedAggregations = true;
        this._getAggregationDataProvider().refresh();
    }

    public isAggregationAppliedToColumn(columnName: string, aggregationFunction?: string): boolean {
        return !!this._getAggregationDataProvider().aggregation.getAggregations().find(agg => {
            if (agg.columnName === columnName) {
                if (aggregationFunction) {
                    return agg.aggregationFunction === aggregationFunction;
                }
                return true;
            }
        })
    }

    public getAggregationForColumn(columnName: string) {
        return this._getAggregationDataProvider().aggregation.getAggregations().find(agg => {
            return agg.columnName === columnName;
        });
    }

    private _updateAggregations() {
        if (!this._hasUserChangedAggregations) {
            this._getAggregationsFromColumns().map(aggregation => {
                this._getAggregationDataProvider().aggregation.addAggregation(aggregation);
            })
        }
        if (this._getAggregationDataProvider().aggregation.getAggregations().length > 0) {
            this._getAggregationDataProvider().refresh();
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

    private _getAggregationDataProvider() {
        return this._dataset.getDataProvider().getFooterAggregationDataProvider();
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
        if (errorCode === 2147750198) {
            errorText = this._grid.labels['error-2147750198']();
        }
        this._dataset.getDataProvider().setError(true, errorText);
        this._pcfContext.factory.requestRender();
    }
}