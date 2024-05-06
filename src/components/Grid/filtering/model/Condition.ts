import { DatasetConditionOperator } from "../../core/enums/ConditionOperator";
import { DataType } from "../../core/enums/DataType";
import { IGridColumn } from "../../core/interfaces/IGridColumn";
import { Grid } from "../../core/model/Grid";
import { GridDependency } from "../../core/model/GridDependency";
import { FilteringUtils } from "../utils/FilteringUtilts";

export class Condition extends GridDependency {
    private _column: IGridColumn;
    private _isAppliedToDataset: boolean = false;
    private _conditionExpression: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression | undefined;
    private _isRemoved?: boolean;
    private _conditionUtils = FilteringUtils.condition();
    //if existing expression is provided, the changes will be written into it
    constructor(grid: Grid, column: IGridColumn, existingExpression?: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression ) {
        super(grid);
        this._column = column;
        this._conditionExpression = existingExpression;
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

    public async getExpression() {
        if (!this._conditionExpression) {
            return this._getDefault();
        }
        this._conditionExpression.conditionOperator = this._operatorDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.value) as any;
        this._conditionExpression.value = this._valueDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.value);
        this._conditionExpression.attributeName = this._attributeNameDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.attributeName);
        return this._conditionExpression;

    }
    public remove() {
        this._isRemoved = true;
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
            set: async (value: any) => this._set("value", undefined, value)
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
        if (this._conditionUtils.value(conditionOperator).isManuallyEditable) {
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
}