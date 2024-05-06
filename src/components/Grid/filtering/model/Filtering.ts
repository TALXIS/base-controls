import { IGridColumn } from "../../core/interfaces/IGridColumn";
import { GridDependency } from "../../core/model/GridDependency";
import { Condition } from "./Condition";

export class Filtering extends GridDependency {
    private _conditions: Map<string, Condition> = new Map();

    public async getExpression() {
        const filterExpression = this._filterExpression;
        for (const condition of this._conditions.values()) {
            const expression = await condition.getExpression();
            if (condition.isAppliedToDataset || condition.isRemoved) {
                filterExpression.conditions = this._filterExpression.conditions.filter(cond => this._getColumnKeyFromCondition(cond) !== condition.column.key);
            }
            if (!condition.isRemoved) {
                filterExpression.conditions.push(expression)
            }
        }
        return filterExpression;
    }

    public clear() {
        //this._conditions.clear();
    }

    public condition(column: IGridColumn): Condition {
        const columnKey = column.key
        const existingExpression = this._filterExpression?.conditions.find(cond => this._getColumnKeyFromCondition(cond) === column.key);
        if (!this._conditions.get(columnKey)) {
            this._conditions.set(columnKey, new Condition(this._grid, column, existingExpression))
        }
        return this._conditions.get(columnKey)!;
    }

    private get _filterExpression() {
        return structuredClone(this._grid.dataset.filtering.getFilter());
    }

    private _getColumnKeyFromCondition(condition: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression) {
        if (condition.entityAliasName) {
            return `${condition.entityAliasName}.${condition.attributeName}`;
        }
        return condition.attributeName;
    }
}
