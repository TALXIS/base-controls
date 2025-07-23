import { DataType, Operators, IFieldValidationResult, FieldValue, DataTypes } from "@talxis/client-libraries";
import { Condition } from "./Condition";

export class NumberCondition extends Condition {
    private _lastSelectedNumberValue: any = null
    private _lastSelectedBetweenValue: any = null;

    constructor(...args: any) {
        ///@ts-ignore
        super(...args)
        //this prefills the lastSelected option
        this._getFilterValue(this._getControlValue(this.getValue()));
    }

    public getDataType(): DataType | null {
        switch (this.getOperator()) {
            case Operators.ContainsData.Value:
            case Operators.DoesNotContainData.Value: {
                return null;
            }
        }
        switch (this.getColumn().dataType) {
            case 'Currency': {
                return 'Decimal';
            }
        }
        return this.getColumn().dataType;
    }

    public getValidationResult(): IFieldValidationResult[] {
        const operator = this.getOperator();
        if (operator !== Operators.Between.Value && operator !== Operators.NotBetween.Value) {
            return super.getValidationResult();
        }
        const value: any[] = this.getControlValue() ?? [null, null];
        const validationResults: IFieldValidationResult[] = [];
        value.map(number => {
            const fieldValue = new FieldValue(number, this.getDataType() ?? DataTypes.SingleLineText, {
                ...this.getMetadata(),
                RequiredLevel: this._getValidationRequiredLevel()
            })
            validationResults.push(fieldValue.isValid());
        })
        return validationResults;
    }

    protected _getControlValue(value: string | string[]): any {

        const isString = typeof value === 'string';
        const isArray = Array.isArray(value);
        const operator = this.getOperator();

        switch (operator) {
            // Operators expecting a single numeric value
            case Operators.Equal.Value:
            case Operators.DoesNotEqual.Value:
            case Operators.GreaterThan.Value:
            case Operators.GreaterThanOrEqual.Value:
            case Operators.LessThan.Value:
            case Operators.LessThanOrEqual.Value:
                if (this._lastSelectedNumberValue != null) {
                    return this._lastSelectedNumberValue;
                }
                if (isString) {
                    const parsed = parseFloat(value as string);
                    return isNaN(parsed) ? value : parsed;
                }
                if (isArray) {
                    return null;
                }
                return value;

            // Operators expecting an array of numeric values
            case Operators.Between.Value:
            case Operators.NotBetween.Value:
                if (this._lastSelectedBetweenValue) {
                    return this._lastSelectedBetweenValue;
                }
                if (isArray) {
                    return (value as string[]).map(val => {
                        const parsed = parseFloat(val);
                        return isNaN(parsed) ? val : parsed;
                    });
                }
                return null;

            default:
                return null;
        }
    }

    protected _getFilterValue(value: number | number[] | string | null): string | string[] | null {

        const isNumber = typeof value === 'number';
        const isString = typeof value === 'string';
        const isArray = Array.isArray(value);
        const operator = this.getOperator();

        switch (operator) {
            // Single numeric or string value expected
            case Operators.Equal.Value:
            case Operators.DoesNotEqual.Value:
            case Operators.GreaterThan.Value:
            case Operators.GreaterThanOrEqual.Value:
            case Operators.LessThan.Value:
            case Operators.LessThanOrEqual.Value:
                this._lastSelectedNumberValue = value;
                if (isNumber) {
                    return value.toString();
                }
                if (isString) {
                    return value;
                }
                return null;

            // Multiple numeric or string values expected
            case Operators.Between.Value:
            case Operators.NotBetween.Value:
                this._lastSelectedBetweenValue = value;
                if (isArray) {
                    return (value as (number | string)[]).map(val => {
                        return typeof val === 'number' ? val.toString() : val;
                    });
                }
                return null;

            default:
                return null;
        }
    }

}