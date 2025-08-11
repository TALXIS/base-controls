import { IDataProvider } from "@talxis/client-libraries";
import { ColumnFilter } from "./ColumnFilter";
import { DataProviderExtension } from "../DataProviderExtension";

export class Filtering extends DataProviderExtension {
    private _columnFilters: Map<string, ColumnFilter> = new Map();

    constructor(getDataProvider: () => IDataProvider) {
        super(getDataProvider);
        this._dataProvider.getColumns().map(col => {
            this.getColumnFilter(col.name);
        })
    }

    public getColumnFilter(columnName: string) {
        if (!this._columnFilters.get(columnName)) {
            this._columnFilters.set(columnName, new ColumnFilter({
                columnName: columnName,
                onGetDataProvider: () => this._dataProvider
            }));
        }
        return this._columnFilters.get(columnName)!;
    }

    public removeColumnFilter(columnName: string) {
        this._columnFilters.delete(columnName);
    }

    public getFilterExpression(filterOperator: ComponentFramework.PropertyHelper.DataSetApi.Types.FilterOperator): ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | false {
        if (!this._validateConditions()) {
            return false;
        }
        return {
            filterOperator: filterOperator,
            conditions: [...this._columnFilters.values()].flatMap(colFilter => colFilter.getExpressionConditions())
        }
    }

    private _validateConditions(): boolean {
        for (const colFilter of [...this._columnFilters.values()]) {
            const conditions = colFilter.getConditions();
            for (const condition of conditions) {
                const validationResult = condition.getValidationResult();
                if (validationResult.some(result => result.error)) {
                    return false;
                }
            }
        }
        return true;
    }

}