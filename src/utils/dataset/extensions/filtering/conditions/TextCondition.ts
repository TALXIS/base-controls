import { Operators, DataTypes } from "@talxis/client-libraries";
import { Condition } from "./Condition";

export class TextCondition extends Condition {
    public getDataType() {
        switch (this.getOperator()) {
            case Operators.ContainsData.Value:
            case Operators.DoesNotContainData.Value: {
                return null;
            }
        }
        switch (this.getColumn().dataType) {
            case 'Multiple':
            case 'SingleLine.TextArea': {
                return DataTypes.Multiple;
            }
        }
        return DataTypes.SingleLineText;
    }
    //value is the current filter
    protected _getControlValue(value: string | null): string | null {
        if (this._isEmptyValue(value)) {
            return null;
        }
        switch (this.getOperator()) {
            case Operators.ContainsData.Value:
            case Operators.DoesNotContainData.Value: {
                return null;
            }
        }
        return value;
    }
    //value is returned from control
    protected _getFilterValue(value: string | number | null): string | null {
        if (this._isEmptyValue(value)) {
            return null;
        }
        if (typeof value === 'number') {
            return value.toString();
        }

        return value;
    }
}