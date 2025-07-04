import { DataTypes, FieldValue, IFieldValidationResult, Operators } from "@talxis/client-libraries";
import { Condition } from "./Condition";
import dayjs from "dayjs";

export class DateCondition extends Condition {
    private _dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    private _lastSelectedDateValue: any = null;
    private _lastSelectedBetweenValue: any = null;
    private _lastSelectedNumberValue: any = null;

    constructor(...args: any) {
        ///@ts-ignore
        super(...args)
        //this prefills the lastSelected option
        this._getFilterValue(this._getControlValue(this.getValue()));
    }

    public getDataType() {
        switch (this.getOperator()) {
            case Operators.ContainsData.Value:
            case Operators.DoesNotContainData.Value:
            case Operators.Today.Value:
            case Operators.Yesterday.Value:
            case Operators.Tomorrow.Value:
            case Operators.ThisWeek.Value:
            case Operators.ThisMonth.Value:
            case Operators.ThisYear.Value:
            case Operators.Next7Days.Value:
            case Operators.Last7Days.Value:
            case Operators.LastYear.Value:
            case Operators.LastMonth.Value:
            case Operators.LastWeek.Value:
                {
                    return null;
                }
            case Operators.LastXDays.Value:
            case Operators.NextXDays.Value:
            case Operators.LastXMonths.Value:
            case Operators.NextXMonths.Value: {
                return DataTypes.WholeNone;
            }
        }

        return DataTypes.DateAndTimeDateOnly;
    }

    public getMetadata() {
        return {
            ...this.getColumn().metadata,
            Behavior: 2,
            Format: 'DateOnly'
        }
    }

    public getValidationResult(): IFieldValidationResult[] {
        const operator = this.getOperator();
        if (operator !== Operators.Between.Value && operator !== Operators.NotBetween.Value) {
            return super.getValidationResult();
        }
        const value: any[] = this.getControlValue() ?? [null, null];
        const validationResults: IFieldValidationResult[] = [];
        value.map(date => {
            const fieldValue = new FieldValue(date, this.getDataType() ?? DataTypes.SingleLineText, {
                ...this.getMetadata(),
                RequiredLevel: this._getValidationRequiredLevel()
            })
            validationResults.push(fieldValue.isValid());
        })
        return validationResults;
    }

    protected _getNullOperators(): ComponentFramework.PropertyHelper.DataSetApi.Types.ConditionOperator[] {
        return [
            Operators.ContainsData.Value,
            Operators.DoesNotContainData.Value,
            Operators.Today.Value,
            Operators.Yesterday.Value,
            Operators.Tomorrow.Value,
            Operators.ThisWeek.Value,
            Operators.ThisMonth.Value,
            Operators.ThisYear.Value,
            Operators.Next7Days.Value,
            Operators.Last7Days.Value,
            Operators.LastYear.Value,
            Operators.LastMonth.Value,
            Operators.LastWeek.Value
        ]
    }

    protected _getDefaultConditionOperator() {
        return Operators.On.Value;
    }
    protected _getControlValue(value: string | string[]): any {

        const isString = typeof value === 'string';
        const isArray = Array.isArray(value);
        const operator = this.getOperator();

        switch (operator) {
            // Single date expected
            case Operators.On.Value:
            case Operators.OnOrAfter.Value:
            case Operators.OnOrBefore.Value:
                if (this._lastSelectedDateValue) {
                    return this._lastSelectedDateValue
                }
                const parsedDate = this._parseDate(value);
                if (isString && parsedDate instanceof Date) {
                    return parsedDate
                }
                else {
                    return null;
                }

            // Multiple dates expected
            case Operators.Between.Value:
            case Operators.NotBetween.Value:
                if (this._lastSelectedBetweenValue) {
                    return this._lastSelectedBetweenValue;
                }
                if (isArray) {
                    return value.map((val) => this._parseDate(val));
                }
                else {
                    return null;
                }

            // Numeric values
            case Operators.LastXDays.Value:
            case Operators.NextXDays.Value:
            case Operators.LastXMonths.Value:
            case Operators.NextXMonths.Value:
                if (this._lastSelectedNumberValue != null) {
                    return this._lastSelectedNumberValue;
                }
                if (isString && typeof this._parseDate(value) === 'string') {
                    const parsed = parseFloat(value);
                    return isNaN(parsed) ? value : parsed;
                }
                else {
                    return null;
                }
        }

        return null;
    }

    protected _getFilterValue(value: Date | Date[] | string | null | number): string | string[] | null {
        const isString = typeof value === 'string';
        const isNumber = typeof value === 'number';
        const isArray = Array.isArray(value);
        const operator = this.getOperator();

        switch (operator) {
            // Single date expected
            case Operators.On.Value:
            case Operators.OnOrAfter.Value:
            case Operators.OnOrBefore.Value:
                this._lastSelectedDateValue = value;
                if (value instanceof Date) {
                    return dayjs(value).format('YYYY-MM-DD');
                } else if (isString) {
                    return value;
                } else {
                    return null;
                }

            // Multiple dates expected
            case Operators.Between.Value:
            case Operators.NotBetween.Value:
                this._lastSelectedBetweenValue = value;
                if (isArray) {
                    return value.map((item) => {
                        if (item instanceof Date) {
                            return dayjs(item).format('YYYY-MM-DD');
                        } else {
                            return item;
                        }
                    });
                } else {
                    return null;
                }

            // Numeric values expected
            case Operators.LastXDays.Value:
            case Operators.NextXDays.Value:
            case Operators.LastXMonths.Value:
            case Operators.NextXMonths.Value:
                this._lastSelectedNumberValue = value;
                if (isNumber) {
                    return value.toString();
                } else if (isString) {
                    return value;
                } else {
                    return null;
                }
        }

        return null;
    }

    private _parseDate(value: any) {
        if (this._dateRegex.test(value)) {
            return dayjs(value).startOf('day').toDate();
        }
        return value;
    }
}