import { DataProviderExtension } from "@talxis/client-libraries";

export class Grouping extends DataProviderExtension {

    public groupColumn(columnName: string): void {
        this._dataProvider.grouping.addGroupBy({
            columnName: columnName,
            alias: `${columnName}_group`,
        })
    }
    public ungroupColumn(alias: string): void {
        const column = this._dataProvider.getColumns().find(col => col.grouping?.alias === alias);
        this._dataProvider.grouping.removeGroupBy(alias);
        this._dataProvider.aggregation.removeAggregation(column?.aggregation?.alias!);
    }
}