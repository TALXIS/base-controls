import { DatasetExtension } from "../DatasetExtension";
import { ColumnFilter } from "./ColumnFilter";

export class Filtering extends DatasetExtension {
    private _columnFilters: Map<string, ColumnFilter> = new Map();

    public getColumnFilter(columnName: string) {
        if (!this._columnFilters.get(columnName)) {
            this._columnFilters.set(columnName, new ColumnFilter({
                columnName: columnName,
                onGetDataset: () => this._dataset
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
                condition.setIsValueRequired(true);
                const validationResult = condition.getValidationResult();
                if (validationResult.some(result => result.error)) {
                    return false;
                }
            }
        }
        return true;
    }

}