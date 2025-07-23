import { Operators, DataTypes, IOperator } from "@talxis/client-libraries";
import { Condition } from "./Condition";

export class MultiSelectOptionSetCondition extends Condition {

    public getDataType() {
        switch (this.getOperator()) {
            case Operators.ContainsData.Value:
            case Operators.DoesNotContainData.Value: {
                return null;
            }
        }
        return DataTypes.MultiSelectOptionSet;
    }

    protected _getControlValue(value: string | string[]): any {
        switch (this.getOperator()) {
            //returns array of numbers
            case Operators.Equal.Value:
            case Operators.DoesNotEqual.Value:
            case Operators.ContainValues.Value:
            case Operators.DoesNotContainValues.Value: {
                if (typeof value === 'string') {
                    return [parseInt(value)];
                }
                if (Array.isArray(value)) {
                    return value.map(x => parseInt(x));
                }
            }
        }
        return null;
    }

    protected _getFilterValue(value: number[] | null): string[] | null {
        if (this._isEmptyValue(value)) {
            return null;
        }
        if (Array.isArray(value)) {
            return value.map(x => x.toString());
        }
        return null;
    }

    protected _getUndecoratedOperator(operator: IOperator["Value"], value: any): IOperator["Value"] {
        if (Array.isArray(value)) {
            switch (operator) {
                case Operators.In.Value: {
                    return Operators.Equal.Value;
                }
                case Operators.NotIn.Value: {
                    return Operators.DoesNotEqual.Value
                }
            }
        }
        return operator;
    }
    protected _getDecoratedOperator(operator: IOperator["Value"], value: any): IOperator["Value"] {
        if (Array.isArray(value)) {
            switch (operator) {
                case Operators.Equal.Value: {
                    return Operators.In.Value;
                }
                case Operators.DoesNotEqual.Value: {
                    return Operators.NotIn.Value
                }
            }
        }
        return operator;
    }
}