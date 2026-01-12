import { EventEmitter, Filtering, Operators, Type } from "@talxis/client-libraries";
import { ITranslation } from "../../../hooks";
import { datasetColumnFilteringTranslations } from "./translations";
import { BaseControls } from "../../../utils";
import { Condition } from '@talxis/client-libraries';

type Labels = Required<ITranslation<typeof datasetColumnFilteringTranslations>>;

export interface IDatasetColumnFilteringModelEvents {
    onSave: (result: false | ComponentFramework.PropertyHelper.DataSetApi.FilterExpression) => void;
    onConditionValueChanged: () => void;
}

interface IDatasetColumnFilteringModelOptions {
    condition: Condition;
    labels: Labels;
    filtering: Filtering;
}

export class DatasetColumnFilteringModel extends EventEmitter<IDatasetColumnFilteringModelEvents> {
    private _condition: Condition;
    private _labels: Labels;
    private _filtering: Filtering;

    constructor(options: IDatasetColumnFilteringModelOptions) {
        super();
        this._condition = options.condition;
        this._labels = options.labels;
        this._filtering = options.filtering;
    }

    public getOperatorOptionSet(): ComponentFramework.PropertyHelper.OptionMetadata[] {
        const operators = this._condition.getColumn().metadata?.SupportedFilterConditionOperators ?? []
        return operators.map(operator => {
            return {
                Value: operator,
                //@ts-ignore - typings
                Label: this._labels[`operator-${operator}`](),
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