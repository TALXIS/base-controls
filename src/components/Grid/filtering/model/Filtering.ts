import { IGridColumn } from "../../core/interfaces/IGridColumn";
import { GridDependency } from "../../core/model/GridDependency";
import { Condition } from "./Condition";

export class Filtering extends GridDependency {
    private _conditions: Map<string, Condition> = new Map();

    public async save(): Promise<boolean> {
        const filterExpression = this._filterExpression;
        for (const condition of this._conditions.values()) {
            if(!condition.value.isValid()) {
                return false;
            }
            const expression = await condition.getExpression();
            if (condition.isAppliedToDataset || condition.isRemoved) {
                filterExpression.conditions = this._filterExpression.conditions.filter(cond => this._getColumnKeyFromCondition(cond) !== condition.column.key);
            }
            if (!condition.isRemoved) {
                filterExpression.conditions.push(expression)
            }
        }
        this.clear();
        this._dataset.filtering.setFilter(filterExpression);
        this._dataset.refresh();
        return true;
    }

    public clear() {
        this._conditions.clear();
    }

    public async condition(column: IGridColumn): Promise<Condition> {
        const columnKey = column.key
        if (!this._conditions.get(columnKey)) {
            this._conditions.set(columnKey, new Condition(this._grid, column))
        }
        const cond = new Proxy(this._conditions.get(columnKey)!, {
            get: (target, prop) => {
                if (prop === 'save') {
                    return async () => {
                        const saveResult = await target.save();
                        if (saveResult) {
                            this._conditions.delete(target.column.key);
                            this._dataset.refresh();
                        }
                        return saveResult;
                    };
                }
                if(prop === 'clear') {
                    this._conditions.delete(target.column.key);
                }
                //@ts-ignore
                if (typeof target[prop] === 'function') {
                    //@ts-ignore
                    return target[prop].bind(target);
                }
                //@ts-ignore
                return target[prop];
            },
        });
        await cond.init();
        return cond;
    }

    private get _filterExpression() {
        return structuredClone(this._grid.dataset.filtering.getFilter()) ?? {
            conditions: [],
            filterOperator: 0
        }
    }

    private _getColumnKeyFromCondition(condition: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression) {
        if (condition.entityAliasName) {
            return `${condition.entityAliasName}.${condition.attributeName}`;
        }
        return condition.attributeName;
    }
}
