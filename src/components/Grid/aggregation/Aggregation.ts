import { AggregationFunction, Dataset, IAggregationMetadata, IDataProvider, IDataset, IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { GridDependency } from "../core/model/GridDependency";
import { Grid } from "../core/model/Grid";

export class Aggregation extends GridDependency {
    private _hasUserChangedAggregations: boolean = false;
    private _eventsRegistered: boolean = false;

    constructor(grid: Grid) {
        super(grid);
        this._dataset.addEventListener('onNewDataLoaded', () => this._updateAggregations())
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
        this._pcfContext.factory.requestRender();
    }

    public removeAggregation(columnName: string) {
        const aggregation = this.getAggregationForColumn(columnName);
        if (aggregation) {
            this._getAggregationDataProvider().aggregation.removeAggregation(aggregation);
        }
        this._hasUserChangedAggregations = true;
        this._getAggregationDataProvider().refresh();
        this._pcfContext.factory.requestRender();
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
        const dataset = this._dataset.getDataProvider().getFooterAggregationDataProvider();
        if (!this._eventsRegistered) {
            dataset.addEventListener('onNewDataLoaded', () => {
                this._pcfContext.factory.requestRender();
            });
            this._eventsRegistered = true;
        }
        return dataset;
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
}