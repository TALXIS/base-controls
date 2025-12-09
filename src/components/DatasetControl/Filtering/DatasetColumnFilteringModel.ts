import { Operators } from "@talxis/client-libraries";
import { ITranslation } from "../../../hooks";
import { datasetColumnFilteringTranslations } from "./translations";
import { BaseControls } from "../../../utils";
import { Condition } from '@talxis/client-libraries';

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
        const dataType = this._condition.getDataType();
        if (!dataType) {
            return null;
        }
        else {
            return BaseControls.GetControlNameForDataType(dataType);
        }
    }
}