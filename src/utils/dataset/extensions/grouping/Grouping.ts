import { DatasetExtension } from "../DatasetExtension";

export class Grouping extends DatasetExtension {
    public isGroupingAppliedToColumn(columnName: string): boolean {
        return !!this._dataset.grouping.getGroupBy(columnName);
    }

    public groupColumn(columnName: string): void {
        this._dataset.grouping.addGroupBy({
            columnName: columnName,
            alias: `${columnName}_group`,
        })
        if (!this._dataset.aggregation.getAggregation(columnName)) {
            this._dataset.aggregation.addAggregation({
                columnName: columnName,
                alias: `${columnName}_countcolumn`,
                aggregationFunction: 'countcolumn'
            })
        }
    }

    public ungroupColumn(columnName: string): void {
        this._dataset.grouping.removeGroupBy(columnName);
        this._dataset.aggregation.removeAggregation(columnName);
    }
}