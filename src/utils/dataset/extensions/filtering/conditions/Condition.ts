import { DataType, DataTypes, EventEmitter, FieldValue, IColumn, IFieldValidationResult, IOperator, Operators } from "@talxis/client-libraries";

interface IConditionDependencies {
    id: string;
    column: IColumn;
    condition?: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression;
}

interface IEvents {
    onOperatorChanged: (operator: IOperator['Value']) => void;
    onValueChanged: (value: any) => void;
    onError: (errorMessage: string) => void;
}

export abstract class Condition extends EventEmitter<IEvents> {
    private _id: string;
    private _column: IColumn;
    private _operator: IOperator['Value'];
    private _datasetCondition?: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression;
    private _isValueRequired: boolean = false;
    protected _filterValue: string | string[] | null;

    constructor({ id, column, condition }: IConditionDependencies) {
        super();
        this._id = id;
        this._column = column;
        this._datasetCondition = condition;

        if (condition) {
            this._operator = this._getUndecoratedOperator(condition.conditionOperator, condition.value);
            this._filterValue = this._getUndecoratedValue(this._operator, condition.value) ?? null;
        } else {
            this._operator = this._getDefaultConditionOperator();
            this._filterValue = this._getDefaultConditionValue();
        }
    }

    //used for validation and deciding which base control to render
    public abstract getDataType(): DataType | null;
    //value parameter contains undecorated filter value
    protected abstract _getControlValue(value: any): any;
    //value parameter contains whatever has been outputed by PCF control
    protected abstract _getFilterValue(value: any): string | string[] | null;

    protected _getNullOperators() {
        return [Operators.ContainsData.Value, Operators.DoesNotContainData.Value]
    }

    protected _isEmptyValue(value: any): boolean {
        return value == null || value === "" || (Array.isArray(value) && value.length === 0)
    }

    protected _getUndecoratedOperator(operator: IOperator['Value'], filterValue: any): IOperator['Value'] {
        return operator;
    }
    protected _getDecoratedOperator(operator: IOperator['Value'], filterValue: any): IOperator['Value'] {
        return operator;
    }

    public getId(): string {
        return this._id;
    }

    public isAppliedToDataset(): boolean {
        return !!this._datasetCondition;
    }

    public setOperator(operator: IOperator['Value']): void {
        this._operator = operator;
        this.setValue(this.getControlValue());
        this.dispatchEvent("onOperatorChanged", operator);
    }

    public getOperator(decorate?: boolean): IOperator['Value'] {
        if (decorate) {
            return this._getDecoratedOperator(this._operator, this._filterValue);
        }
        return this._operator;
    }
    public getColumn(): IColumn {
        return this._column;
    }

    public getValue(decorate?: boolean) {
        if (decorate) {
            return this._getDecoratedValue(this._filterValue);
        }
        return this._filterValue;
    }

    //accepts value in PCF control format
    public setValue(value: any): void {
        this._filterValue = this._getFilterValue(value);
        this.dispatchEvent("onValueChanged", this._filterValue);
    }

    public getControlValue(): any {
        return this._getControlValue(this._filterValue);
    }

    public getMetadata() {
        return this._column.metadata;
    }

    public isValueLoading(): boolean {
        return false;
    }

    public getBindings(): { [key: string]: any } {
        return {};
    }

    public getValidationResult(): IFieldValidationResult[] {
        const fieldValue = new FieldValue(this.getControlValue(), this.getDataType() ?? DataTypes.SingleLineText, {
            ...this.getMetadata(),
            RequiredLevel: this._getValidationRequiredLevel()
        })
        return [fieldValue.isValid()];
    }

    public setIsValueRequired(isRequired: boolean) {
        this._isValueRequired = isRequired;
    }

    protected _getDefaultConditionOperator(): IOperator['Value'] {
        return Operators.Equal.Value;
    }

    protected _getDefaultConditionValue(): null {
        return null;
    }

    protected _getValidationRequiredLevel() {
        if (this._getNullOperators().includes(this._operator) || !this._isValueRequired) {
            return 0
        }
        return 1;
    }

    private _getUndecoratedValue(operator: IOperator['Value'], value: any): any {
        if (typeof value === "string") {
            switch (operator) {
                case Operators.BeginsWith.Value:
                case Operators.DoesNotBeginWith.Value:
                    value = value.slice(0, -1);
                    break;

                case Operators.EndsWith.Value:
                case Operators.DoesNotEndWith.Value:
                    value = value.slice(1);
                    break;

                case Operators.Like.Value:
                case Operators.NotLike.Value:
                    value = value.slice(1, -1);
                    break;
            }
        }
        return value;
    }

    //should be run through on save
    private _getDecoratedValue(value: any) {
        if (typeof value === "string") {
            switch (this._operator) {
                case Operators.BeginsWith.Value:
                case Operators.DoesNotBeginWith.Value:
                    value = `${value}%`;
                    break;

                case Operators.EndsWith.Value:
                case Operators.DoesNotEndWith.Value:
                    value = `%${value}`;
                    break;

                case Operators.Like.Value:
                case Operators.NotLike.Value:
                    value = `%${value}%`;
                    break;
            }
        }
        return value;
    }
}
