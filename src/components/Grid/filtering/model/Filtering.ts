import { DataType, DataTypes, IColumn, IDataProvider, IDataset, IOperator, Operators } from "@talxis/client-libraries";
import { IGridColumn } from "../../core/interfaces/IGridColumn";
import { DatasetExtension } from "../../core/model/DatasetExtension";
import { GridDependency } from "../../core/model/GridDependency";




interface IConditionDependencies {
    id: string;
    column: IColumn;
    condition?: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression;
}



abstract class Condition2 {
    private _datasetCondition?: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression;
    private _id: string;
    private _operator: IOperator['Value'];
    //always decorated!
    private _value: any = null;
    private _column: IColumn;

    constructor({ id, column, condition }: IConditionDependencies) {
        this._id = id;
        this._column = column;
        this._datasetCondition = condition;
        if(this._datasetCondition) {
            this._value = this._datasetCondition.value;
            this._operator = this._datasetCondition.conditionOperator;
        }
        this._operator = this._getDefaultConditionOperator();
    }

    public getId() {
        return this._id;
    }

    public isAppliedToDataset(): boolean {
        return !!this._datasetCondition;
    }

    public setOperator(operator: IOperator['Value']) {
        this._operator = operator;
    }
    public getOperator() {
        return this._operator;
    }

    public setValue(value: any) {
        this._value = value;
    }

    //this should produce a value that i can stick into a Base Control
    public getUndecoratedValue() {
        let value = this._value;
        switch (this._operator) {
            case Operators.BeginsWith.Value:
            case Operators.DoesNotBeginWith.Value: {
                value = value.slice(0, -1);
                break;
            }
            case Operators.EndsWith.Value:
            case Operators.DoesNotEndWith.Value: {
                value = value.slice(1);
                break;
            }
            case Operators.Like.Value:
            case Operators.NotLike.Value: {
                value = value.slice(1, -1);
                break;
            }
        }
        return this._getUndecoratedValue(value);
    }

    protected abstract _getUndecoratedValue(value: any): any;

    protected _getColumn(): IColumn {
        return this._column;
    }

    protected _getDefaultConditionOperator(): IOperator['Value'] {
        return Operators.Equal.Value;
    }
}

class TextCondition extends Condition2 {
    public getDataType() {
        switch (this.getOperator()) {
            case Operators.ContainsData.Value:
            case Operators.DoesNotContainData.Value: {
                return null;
            }
        }
        return DataTypes.SingleLineText;
    }
    protected _getUndecoratedValue(value: string): string | null {
        return value ?? null;
    }
}

class NumberCondition extends Condition2 {
    private _operatorValueMap: Map<IOperator['Value'], any> = new Map();

    protected _getUndecoratedValue(value: string): null | number {
        switch (this.getOperator()) {
            case Operators.Equal.Value:
            case Operators.DoesNotEqual.Value:
            case Operators.GreaterThan.Value:
            case Operators.GreaterThanOrEqual.Value:
            case Operators.LessThan.Value:
            case Operators.LessThanOrEqual.Value: {
                const parsedValue = parseFloat(value);
                if (!isNaN(parsedValue)) {
                    this._operatorValueMap.set(Operators.Equal.Value, parsedValue);
                }
                return this._operatorValueMap.get(Operators.Equal.Value) ?? null;
            }
        }
        return null;
    }
}

class DateCondition extends Condition2 {
    private _operatorValueMap: Map<IOperator['Value'], any> = new Map();
    private _dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    protected _getDefaultConditionOperator() {
        return Operators.On.Value;
    }
    protected _getUndecoratedValue(value: string | string[]): Date | null | number {
        switch (this.getOperator()) {
            //returns date
            case Operators.On.Value:
            case Operators.OnOrAfter.Value:
            case Operators.OnOrBefore.Value: {
                if (typeof value === 'string') {
                    if (this._dateRegex.test(value)) {
                        this._operatorValueMap.set(Operators.On.Value, new Date(value));
                    }
                }
                return this._operatorValueMap.get(Operators.On.Value) ?? null;
            }
            //returns array of dates
            case Operators.Between.Value:
            case Operators.NotBetween.Value: {
                if (Array.isArray(value)) {
                    const result = value.every(dateString => {
                        return this._dateRegex.test(dateString);
                    })
                    if (result) {
                        this._operatorValueMap.set(Operators.Between.Value, value.map(dateString => new Date(dateString)));
                    }
                }
                return this._operatorValueMap.get(Operators.On.Value) ?? null;
            }
            //returns number
            case Operators.LastXDays.Value:
            case Operators.NextXDays.Value:
            case Operators.LastXMonths.Value:
            case Operators.NextXMonths.Value: {
                if (typeof value === 'string') {
                    const parsedValue = parseInt(value);
                    if (!isNaN(parsedValue)) {
                        this._operatorValueMap.set(Operators.LastXDays.Value, parsedValue)
                    }
                    return this._operatorValueMap.get(Operators.LastXDays.Value) ?? null;
                }
                return this._operatorValueMap.get(Operators.LastXDays.Value) ?? null;
            }
        }
        return null;
    }
}

class OptionSetCondition extends Condition2 {
    private _operatorValueMap: Map<IOperator['Value'], any> = new Map();
    protected _getUndecoratedValue(value: string | string[]): number[] | null | string {
        const optionSet = this._getColumn().metadata?.OptionSet ?? [];
        switch (this.getOperator()) {
            //return array of numbers
            case Operators.Equal.Value:
            case Operators.DoesNotEqual.Value:
            case Operators.ContainValues.Value:
            case Operators.DoesNotContainValues.Value: {
                if (typeof value === 'string') {
                    //@ts-ignore - typings
                    const result = optionSet.find(option => option.Value == value);
                    if (result) {
                        this._operatorValueMap.set(Operators.Equal.Value, [parseInt(value)]);
                    }
                }
                else {
                    this._operatorValueMap.set(Operators.Equal.Value, value.map(x => parseInt(x)));
                }
                return this._operatorValueMap.get(Operators.Equal.Value) ?? [];
            }
            //return string
            case Operators.BeginsWith.Value:
            case Operators.DoesNotBeginWith.Value:
            case Operators.EndsWith.Value:
            case Operators.DoesNotEndWith.Value:
            case Operators.Like.Value: {
                if (typeof value === 'string') {
                    //@ts-ignore - typings
                    const result = optionSet.every(option => option.Value != value)
                    if (result) {
                        this._operatorValueMap.set(Operators.BeginsWith.Value, value);
                    }
                }
                return this._operatorValueMap.get(Operators.BeginsWith.Value) ?? null;
            }
        }
        return null;
    }
}

class MultiSelectOptionSetCondition extends Condition2 {
    protected _getUndecoratedValue(value: string | string[]): number[] | null {
        switch (this.getOperator()) {
            //returns array of numbers
            case Operators.Equal.Value:
            case Operators.DoesNotEqual.Value:
            case Operators.ContainValues.Value:
            case Operators.DoesNotContainValues.Value: {
                if (typeof value === 'string') {
                    return [parseInt(value)];
                }
                return value.map(x => parseInt(x));
            }
        }
        return null;
    }
}

class FileCondition extends Condition2 {
    protected _getDefaultConditionOperator() {
        return Operators.NotNull.Value;
    }
    protected _getUndecoratedValue(): null {
        return null;
    }
}

class ImageCondition extends Condition2 {
    protected _getDefaultConditionOperator() {
        return Operators.NotNull.Value;
    }
    protected _getUndecoratedValue(): null {
        return null;
    }
}

class LookupCondition extends Condition2 {
    private _operatorValueMap: Map<IOperator['Value'], any> = new Map();
    protected _getUndecoratedValue(value: string | string[]): ComponentFramework.LookupValue[] | string | null {
        switch (this.getOperator()) {
            //returns array of lookup values
            case Operators.Equal.Value:
            case Operators.DoesNotEqual.Value: {
                if (typeof value === 'string') {
                    if (value.startsWith('{') && value.endsWith('}')) {
                        const lookupValue: ComponentFramework.LookupValue = {
                            entityType: this._getColumn().metadata!.EntityLogicalName!,
                            id: value.slice(1, -1),
                            name: '',
                        }
                        this._operatorValueMap.set(Operators.Equal.Value, [lookupValue]);
                    }
                }
                else {
                    const lookupValues = value.map(x => {
                        return {
                            entityType: this._getColumn().metadata!.EntityLogicalName!,
                            id: x.slice(1, -1),
                            name: '',
                        } as ComponentFramework.LookupValue
                    })
                    this._operatorValueMap.set(Operators.Equal.Value, lookupValues);
                }
                return this._operatorValueMap.get(Operators.Equal.Value) ?? [];
            }
            //returns string
            case Operators.Like.Value:
            case Operators.NotLike.Value:
            case Operators.BeginsWith.Value:
            case Operators.DoesNotBeginWith.Value:
            case Operators.EndsWith.Value:
            case Operators.DoesNotEndWith.Value: {
                if (typeof value === 'string') {
                    if (!value.startsWith('{') && !value.endsWith('}')) {
                        this._operatorValueMap.set(Operators.Like.Value, value);
                    }
                }
                return this._operatorValueMap.get(Operators.Like.Value) ?? null;
            }
        }
        return null;
    }
}


class ColumnFilter extends DatasetExtension {
    private _conditions: Map<string, Condition2> = new Map();
    private _column: IColumn;

    constructor(onGetDataset: () => IDataset, columnName: string) {
        super(onGetDataset);
        this._column = this._dataset.getDataProvider().getColumnsMap().get(columnName)!;
        this._dataset.addEventListener('onNewDataLoaded', () => this._createConditionsFromFilterExpression())
        this._createConditionsFromFilterExpression();
    }

    public isAppliedToDataset(): boolean {
        return !![...this._conditions.values()].find(cond => cond.isAppliedToDataset());
    }
    public getCondition(id: string) {
        return this._conditions.get(id);
    }
    public removeCondition(id: string) {
        this._conditions.delete(id);
    }
    public getConditions(): Condition2[] {
        return [...this._conditions.values()];
    }

    private _createConditionsFromFilterExpression() {
        this._conditions.clear();
        const conditions = this._dataset.filtering.getFilter()?.conditions ?? [];
        conditions.map(cond => {
            const attributeName = this._undecorateAttributeName(cond.attributeName);
            const alias = cond.entityAliasName ? `${cond.entityAliasName}.${attributeName}` : attributeName;
            const ConditionClass = this._getConditionClass();
            const id = crypto.randomUUID();
            let condition: Condition2;
            if (alias === this._column.name) {
                condition = new ConditionClass({ id, column: this._column, condition: cond });
            }
            else {
                condition = new ConditionClass({id, column: this._column})
            }
            this._conditions.set(id, condition);
        });
        console.log(this.getConditions());
    }

    private _getConditionClass() {
        switch (this._column.dataType) {
            case DataTypes.DateAndTimeDateAndTime:
            case DataTypes.DateAndTimeDateOnly: {
                return DateCondition;
            }
            case DataTypes.WholeDuration:
            case DataTypes.Decimal:
            case DataTypes.WholeTimeZone:
            case DataTypes.WholeNone:
            case DataTypes.WholeLanguage: {
                return NumberCondition;
            }
            case DataTypes.Image: {
                return ImageCondition;
            }
            case DataTypes.File: {
                return FileCondition;
            }
            case DataTypes.MultiSelectOptionSet: {
                return MultiSelectOptionSetCondition;
            }
            case DataTypes.OptionSet:
            case DataTypes.TwoOptions: {
                return OptionSetCondition;
            }
            case DataTypes.LookupCustomer:
            case DataTypes.LookupOwner:
            case DataTypes.LookupRegarding:
            case DataTypes.LookupSimple: {
                return LookupCondition;
            }
            default: {
                return TextCondition;
            }
        }
    }

    private _undecorateAttributeName(attributeName: string): string {
        switch (this._column.dataType) {
            case DataTypes.LookupCustomer:
            case DataTypes.LookupOwner:
            case DataTypes.LookupRegarding:
            case DataTypes.LookupSimple:
            case DataTypes.OptionSet:
            case DataTypes.TwoOptions: {
                if (attributeName.endsWith('name')) {
                    return attributeName.slice(0, -4);
                }
                return attributeName;
            }
        }
        return attributeName;
    }

}

export class Filtering2 extends DatasetExtension {
    private _columnFilters: Map<string, ColumnFilter> = new Map();
    constructor(onGetDataset: () => IDataset) {
        super(onGetDataset);
    }

    public getColumnFilter(columnName: string) {
        if (!this._columnFilters.get(columnName)) {
            this._columnFilters.set(columnName, new ColumnFilter(() => this._dataset, columnName));
        }
        return this._columnFilters.get(columnName)!;
    }
}

export class Filtering extends GridDependency {
    //@ts-ignore
    private _conditions: Map<string, Condition> = new Map();

    public async save(): Promise<boolean> {
        const filterExpression = this._filterExpression;
        for (const condition of this._conditions.values()) {
            if (!condition.value.isValid()) {
                return false;
            }
            const expression = await condition.getExpression();
            if (condition.isAppliedToDataset || condition.isRemoved) {
                filterExpression.conditions = this._filterExpression.conditions.filter(cond => this._getColumnKeyFromCondition(cond) !== condition.column.name);
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

    //@ts-ignore - a
    public async condition(column: IGridColumn): Promise<Condition> {
        const columnKey = column.name
        if (!this._conditions.get(columnKey)) {
            //@ts-ignore
            this._conditions.set(columnKey, new Condition(() => this._dataset, column))
        }
        const cond = new Proxy(this._conditions.get(columnKey)!, {
            get: (target, prop) => {
                if (prop === 'save') {
                    return async () => {
                        const saveResult = await target.save();
                        if (saveResult) {
                            this._conditions.delete(target.column.name);
                            this._dataset.refresh();
                        }
                        return saveResult;
                    };
                }
                if (prop === 'clear') {
                    this._conditions.delete(target.column.name);
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
        return structuredClone(this._dataset.filtering.getFilter()) ?? {
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
