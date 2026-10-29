import { EventEmitter, Filtering, Operators, Type } from "@talxis/client-libraries";
import { BaseControls, LabelsOf } from "@utils";
import { Condition } from '@talxis/client-libraries';
import { FILTER_OPERATOR_LABEL_KEYS, FILTER_OPERATORS_LABELS } from "./labels";

export interface IDatasetColumnFilteringModelEvents {
    onSave: (result: false | ComponentFramework.PropertyHelper.DataSetApi.FilterExpression) => void;
    onConditionValueChanged: () => void;
}

interface IDatasetColumnFilteringModelOptions {
    condition: Condition;
    operatorLabels: LabelsOf<typeof FILTER_OPERATORS_LABELS>;
    filtering: Filtering;
}

export class DatasetColumnFilteringModel extends EventEmitter<IDatasetColumnFilteringModelEvents> {
    private _condition: Condition;
    private _operatorLabels: LabelsOf<typeof FILTER_OPERATORS_LABELS>;
    private _filtering: Filtering;

    constructor(options: IDatasetColumnFilteringModelOptions) {
        super();
        this._condition = options.condition;
        this._operatorLabels = options.operatorLabels;
        this._filtering = options.filtering;
    }

    public getOperatorOptionSet(): ComponentFramework.PropertyHelper.OptionMetadata[] {
        const operators = this._condition.getColumn().metadata?.SupportedFilterConditionOperators ?? []
        return operators.map(operator => {
            return {
                Value: operator,
                Label: this._operatorLabels.get(FILTER_OPERATOR_LABEL_KEYS[operator]),
                Color: ''
            }
        })
    }

    public setConditionValue(value: any, index: number) {
        const operator = this._condition.getOperator();
        if (operator !== Operators.Between.Value && operator !== Operators.NotBetween.Value) {
            this._condition.setValue(value);
        }
        else {
            const values = [this._condition.getControlValue()?.[0] ?? null, this._condition.getControlValue()?.[1] ?? null];
            if (index === 0) {
                values[0] = value;
            }
            else {
                values[1] = value;
            }
            this._condition.setValue(values);
        }
        this.dispatchEvent('onConditionValueChanged');
    }

    public getConditionValue(): any[] {
        const operator = this._condition.getOperator();
        let value = this._condition.getControlValue();
        switch (operator) {
            case Operators.Like.Value:
            case Operators.NotLike.Value: {
                if(typeof value === 'string' && value.startsWith('*')) {
                    value = value.substring(1);
                    this._condition.setValue(value);
                }
                break;
            }
        }
        if (operator !== Operators.Between.Value && operator !== Operators.NotBetween.Value) {
            return [value];
        }
        if (Array.isArray(value)) {
            return value;
        }
        return [null, null];
    }

    public getControlName() {
        const dataType = this._condition.getDataType();
        if (!dataType) {
            return null;
        }
        else {
            return BaseControls.GetControlNameForDataType(dataType);
        }
    }
    public save() {
        const operator = this._condition.getOperator();
        switch (operator) {
            case Operators.Like.Value:
            case Operators.NotLike.Value: {
                this._condition.setValue(`*${this._condition.getControlValue() ?? ''}`);
                break;
            }
        }
        this._condition.setIsValueRequired(true);
        const result = this._filtering.getFilterExpression(Type.And.Value);
        if (!result) {
            switch (operator) {
                case Operators.Like.Value:
                case Operators.NotLike.Value: {
                    this._condition.setValue(this._condition.getControlValue()?.substring(1))
                }
            }
        }
        this.dispatchEvent('onSave', result);
    }
}