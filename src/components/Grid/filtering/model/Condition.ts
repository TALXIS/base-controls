import { DatasetConditionOperator } from "../../core/enums/ConditionOperator";
import { DataType } from "../../core/enums/DataType";
import { IGridColumn } from "../../core/interfaces/IGridColumn";
import { Grid } from "../../core/model/Grid";
import { GridDependency } from "../../core/model/GridDependency";
import { ColumnValidation } from "../../validation/model/ColumnValidation";
import { FilteringUtils } from "../utils/FilteringUtilts";

export class Condition extends GridDependency {

    private _column: IGridColumn;
    private _isAppliedToDataset: boolean = false;
    private _conditionExpression: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression | undefined;
    private _isRemoved?: boolean;
    private _conditionUtils = FilteringUtils.condition();
    private _isValid: boolean = true;

    constructor(grid: Grid, column: IGridColumn ) {
        super(grid);
        this._column = column;
        this._conditionExpression = this._filterExpression?.conditions.find(cond => this._attributeNameDecorator(cond.conditionOperator, cond.attributeName, true) === column.attributeName);
        if (!this._conditionExpression) {
            return;
        }
        this._isAppliedToDataset = true;
        this._conditionExpression.value = this._valueDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.value, true);
        this._conditionExpression.attributeName = this._attributeNameDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.attributeName, true)
    }

    public get isRemoved() {
        return this._isRemoved;
    }

    public get column() {
        return this._column;
    }

    public get isAppliedToDataset() {
        return this._isAppliedToDataset;
    }

    public get isValid() {
        return this._isValid;
    }

    public async getExpression() {
        if (!this._conditionExpression) {
            return this._getDefault();
        }
        const result = {...this._conditionExpression};
        result.conditionOperator = this._operatorDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.value) as any;
        result.value = this._valueDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.value);
        result.attributeName = this._attributeNameDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.attributeName);
        return result;

    }
    public async save(): Promise<boolean> {
        if(!await this.value.isValid()) {
            this._isValid = false;
            this._triggerRefreshCallbacks();
            return false;
        }
        const filterExpression = this._filterExpression;
        if(this._isAppliedToDataset || this._isRemoved) {
            filterExpression.conditions = filterExpression.conditions.filter(cond => this._attributeNameDecorator(cond.conditionOperator, cond.attributeName, true) !== this._column.attributeName);
        }
        if(!this._isRemoved) {
            filterExpression.conditions.push(await this.getExpression());
        }
        this._dataset.filtering.setFilter(filterExpression);
        this._dataset.refresh();
        return true;

    }
    public remove() {
        this._isRemoved = true;
        this.save();
    }
    public async clear() {
        this._conditionExpression = await this._getDefault();
    }
    public get operator() {
        return {
            get: async () => this._get('operator') as Promise<DatasetConditionOperator>,
            set: async (conditionOperator: DatasetConditionOperator) => {
                await this._set("operator", conditionOperator, null);
                const isCurrentEditable = this._conditionUtils.value(conditionOperator).isManuallyEditable;
                const isPreviousEditable = this._conditionUtils.value(this._conditionExpression!.conditionOperator).isManuallyEditable

                if (isCurrentEditable !== isPreviousEditable) {
                    // we are transitioning between editable and non-editable operators and the value of these data types needs to be set to null
                    // to prevent type incompability
                    switch (this._column.dataType) {
                        case DataType.MULTI_SELECT_OPTIONSET:
                        case DataType.OPTIONSET:
                        case DataType.TWO_OPTIONS:
                        case DataType.LOOKUP_SIMPLE:
                        case DataType.LOOKUP_OWNER:
                        case DataType.DATE_AND_TIME_DATE_AND_TIME:
                        case DataType.DATE_AND_TIME_DATE_ONLY: {
                            this._conditionExpression!.value = ""
                            break;
                        }
                    }
                }
            },
        }
    }

    public get value() {
        return {
            get: async () => this._get('value') as Promise<any>,
            set: async (value: any) => this._set("value", undefined, value),
            isValid: async () => {
                const [result, errorMessage] = await new ColumnValidation(this._column.dataType!).validate(await this.value.get());
                return result;
            }
        }
    }
    private async _get(type: 'operator' | 'value'): Promise<DatasetConditionOperator | any> {
        if (!this._conditionExpression) {
            this._conditionExpression = await this._getDefault();
        }
        if(type === 'operator') {
            return this._conditionExpression.conditionOperator;
        }
        return this._conditionExpression.value;
    }
    private async _set(type: 'operator' | 'value', conditionOperator?: DatasetConditionOperator, value?: any) {
        this._isValid = true;
        if (!this._conditionExpression) {
            this._conditionExpression = await this._getDefault();
        }
        if (type === 'operator') {
            this._conditionExpression.conditionOperator = conditionOperator as any;
        }
        else {
            this._conditionExpression.value = value;
        }
        this._triggerRefreshCallbacks();
    }

    private _attributeNameDecorator(conditionOperator: DatasetConditionOperator, attributeName: string, undecorate?: boolean) {
        if (!this._conditionUtils.value(conditionOperator).isManuallyEditable) {
            return attributeName;
        }
        switch (this._column.dataType) {
            case DataType.OPTIONSET:
            case DataType.TWO_OPTIONS:
            case DataType.LOOKUP_OWNER:
            case DataType.LOOKUP_SIMPLE: {
                if (undecorate) {
                    if (attributeName.endsWith('name')) {
                        return attributeName.slice(0, -4);
                    }
                    return attributeName;
                }
                if (attributeName.endsWith('name')) {
                    return attributeName;
                }
                return `${attributeName}name`

            }
            default: {
                return attributeName;
            }
        }
    }

    private _valueDecorator(conditionOperator: DatasetConditionOperator, value: any, undecorate?: boolean) {
        switch (conditionOperator) {
            case DatasetConditionOperator.BeginWith:
            case DatasetConditionOperator.DoesNotBeginWith: {
                if (undecorate) {
                    return value.slice(0, -1);
                }
                return `${value}%`;
            }
            case DatasetConditionOperator.EndsWith:
            case DatasetConditionOperator.DoesNotEndWith: {
                if (undecorate) {
                    return value.slice(1)
                }
                return `%${value}`;
            }
            case DatasetConditionOperator.Like:
            case DatasetConditionOperator.NotLike: {
                if (undecorate) {
                    return value.slice(1, -1)
                }
                return `%${value}%`;
            }
            default: {
                return value;
            }
        }
    }

    private _operatorDecorator(conditionOperator: DatasetConditionOperator, value: any): DatasetConditionOperator {
        switch (this._column.dataType) {
            case DataType.MULTI_SELECT_OPTIONSET:
            case DataType.OPTIONSET:
            case DataType.TWO_OPTIONS:
            case DataType.LOOKUP_OWNER:
            case DataType.LOOKUP_SIMPLE: {
                //we need to switch the operators based on the number of selected options
                if (typeof value !== 'string') {
                    switch (conditionOperator) {
                        case DatasetConditionOperator.Equal: {
                            return DatasetConditionOperator.In;
                        }
                        case DatasetConditionOperator.NotEqual: {
                            return DatasetConditionOperator.NotIn;
                        }
                    }
                }
                else {
                    switch (conditionOperator) {
                        case DatasetConditionOperator.In: {
                            return DatasetConditionOperator.Equal;
                        }
                        case DatasetConditionOperator.NotIn: {
                            return DatasetConditionOperator.NotEqual;
                        }
                    }
                }
            }
        }
        return conditionOperator;
    }

    private async _getAttributeName(conditionOperator: DatasetConditionOperator): Promise<string> {
        if (this._column.dataType !== DataType.LOOKUP_SIMPLE && this._column.dataType !== DataType.LOOKUP_OWNER) {
            return this._column.attributeName;
        }
        switch (conditionOperator) {
            case DatasetConditionOperator.BeginWith:
            case DatasetConditionOperator.DoesNotBeginWith:
            case DatasetConditionOperator.EndsWith:
            case DatasetConditionOperator.DoesNotEndWith:
            case DatasetConditionOperator.Like:
            case DatasetConditionOperator.NotLike: {
                const metadata = await this._grid.pcfContext.utils.getEntityMetadata(this._grid.dataset.getTargetEntityType(), [this._column.attributeName]);
                return `${this._column.attributeName}${metadata.PrimaryNameAttribute}`;
            }
            default: {
                return this._column.attributeName;
            }
        }
    }

    private async _getDefault(): Promise<ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression> {
        const cond: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression = {
            attributeName: await this._getAttributeName(DatasetConditionOperator.Equal),
            conditionOperator: DatasetConditionOperator.Equal,
            entityAliasName: this._column.entityAliasName,
            value: ""
        }
        switch (this._column.dataType) {
            case DataType.DATE_AND_TIME_DATE_AND_TIME:
            case DataType.DATE_AND_TIME_DATE_ONLY: {
                cond.conditionOperator = DatasetConditionOperator.On;
                break;
            }
            case DataType.IMAGE:
            case DataType.FILE: {
                cond.conditionOperator = DatasetConditionOperator.NotNull as any;
                break;
            }
        }
        return cond;
    }



    private get _filterExpression() {
        return structuredClone(this._dataset.filtering.getFilter()) ?? {
            conditions: [],
            filterOperator: 0
        }
    }

}