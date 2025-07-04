import { DataTypes, IOperator, Operators } from "@talxis/client-libraries";
import { Condition } from "./Condition";

export class OptionSetCondition extends Condition {
    private _lastSelectedOptionSetValue: number[] | null = null;
    private _lastSelectedStringValue: string | null = null;

    constructor(...args: any){
        ///@ts-ignore
        super(...args)
        //this prefills the lastSelected option
        this._getFilterValue(this._getControlValue(this.getValue()));
    }
    public getMetadata() {
        const metadata = super.getMetadata();
        return {
            ...metadata,
            Options: metadata?.OptionSet ?? []
        }
    }

    public getDataType() {
        switch (this.getOperator()) {
            case Operators.ContainsData.Value:
            case Operators.DoesNotContainData.Value: {
                return null;
            }
            case Operators.Equal.Value:
            case Operators.DoesNotEqual.Value:
            case Operators.ContainValues.Value:
            case Operators.DoesNotContainValues.Value: {
                return DataTypes.MultiSelectOptionSet;
            }

        }
        return DataTypes.SingleLineText;
    }
    protected _getControlValue(value: string | string[] | null): any {

        const isString = typeof value === 'string';
        const isArray = Array.isArray(value);
        const operator = this.getOperator();
        const optionSet = this.getMetadata().Options;
        const match = optionSet.find(option => option.Value.toString() == value);

        switch (operator) {
            // Expect array of numeric values (based on option set values)
            case Operators.Equal.Value:
            case Operators.DoesNotEqual.Value:
            case Operators.ContainValues.Value:
            case Operators.DoesNotContainValues.Value:
                if(this._lastSelectedOptionSetValue) {
                    return this._lastSelectedOptionSetValue;
                }
                if (isString) {
                    return match ? [parseInt(value)] : null;
                }
                if (isArray) {
                    return (value as string[]).map(v => parseInt(v));
                }
                return null;

            // Expect a single string value (text search)
            case Operators.BeginsWith.Value:
            case Operators.DoesNotBeginWith.Value:
            case Operators.EndsWith.Value:
            case Operators.DoesNotEndWith.Value:
            case Operators.Like.Value:
            case Operators.NotLike.Value:
                if(this._lastSelectedStringValue) {
                    return this._lastSelectedStringValue;
                }
                if (isString) {
                    return !match ? value : null;
                }
                return null;

            default:
                return null;
        }
    }

    protected _getFilterValue(value: number[] | string | null): string | string[] | null {
        const isString = typeof value === 'string';
        const isArray = Array.isArray(value);
        const operator = this.getOperator();

        switch (operator) {
            // Return a single string or array of strings based on number input
            case Operators.Equal.Value:
            case Operators.DoesNotEqual.Value:
            case Operators.ContainValues.Value:
            case Operators.DoesNotContainValues.Value:
                this._lastSelectedOptionSetValue = value as number[];
                if (isArray) {
                    if (value.length === 1) {
                        return value[0].toString();
                    }
                    return value.map(v => v.toString());
                }
                return null;

            // Return string for pattern-based operators
            case Operators.BeginsWith.Value:
            case Operators.DoesNotBeginWith.Value:
            case Operators.EndsWith.Value:
            case Operators.DoesNotEndWith.Value:
            case Operators.Like.Value:
            case Operators.NotLike.Value:
                this._lastSelectedStringValue = value as string;
                return isString ? value : null;

            default:
                return null;
        }
    }

    protected _getUndecoratedOperator(operator: IOperator["Value"], value: any): IOperator["Value"] {
        if(Array.isArray(value)) {
            switch(operator) {
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
        if(Array.isArray(value)) {
            switch(operator) {
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