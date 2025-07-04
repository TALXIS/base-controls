import { Operators } from "@talxis/client-libraries";
import { ITranslation } from "../../../hooks";
import { Condition } from "../../../utils/dataset/extensions/filtering/conditions";
import { datasetColumnFilteringTranslations } from "./translations";
import { BaseControls } from "../../../utils";

type Labels = Required<ITranslation<typeof datasetColumnFilteringTranslations>>;

export class DatasetColumnFilteringModel {
    private _condition: Condition;
    private _labels: Labels;

    constructor(condition: Condition, labels: Labels) {
        this._condition = condition;
        this._labels = labels;
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
            this._condition.setControlValue(value);
        }
        else {
            const values = [this._condition.getControlValue()?.[0] ?? null, this._condition.getControlValue()?.[1] ?? null];
            if (index === 0) {
                values[0] = value;
            }
            else {
                values[1] = value;
            }
            this._condition.setControlValue(values);
        }
    }

    public getConditionValue(): any[] {
        const operator = this._condition.getOperator();
        if (operator !== Operators.Between.Value && operator !== Operators.NotBetween.Value) {
            return [this._condition.getControlValue()];
        }
        const value = this._condition.getControlValue();
        if (Array.isArray(value)) {
            return value;
        }
        return [null, null];
    }
    
    public getControlName() {
        switch (this._condition.getDataType()) {
            case 'Currency':
            case 'Decimal':
            case 'Whole.None':
            case 'Whole.Language':
            case 'Whole.TimeZone': {
                return BaseControls.Decimal;
            }
            case 'DateAndTime.DateAndTime':
            case 'DateAndTime.DateOnly': {
                return BaseControls.DateTime;
            }
            case 'Lookup.Customer':
            case 'Lookup.Owner':
            case 'Lookup.Regarding':
            case 'Lookup.Simple': {
                return BaseControls.Lookup;
            }
            case 'SingleLine.Email':
            case 'SingleLine.Phone':
            case 'SingleLine.Text':
            case 'SingleLine.TextArea':
            case 'Multiple':
            case 'SingleLine.URL': {
                return BaseControls.TextField;
            }
            case 'TwoOptions':
            case 'OptionSet':
            case 'MultiSelectPicklist': {
                return BaseControls.MultiSelectOptionSet;
            }
            case 'Whole.Duration': {
                return BaseControls.Duration;
            }
        }
        return null;
    }
}