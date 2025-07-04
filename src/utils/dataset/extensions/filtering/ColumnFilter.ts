import { Attribute, DataTypes, IColumn, IDataset, IOperator, Operators } from "@talxis/client-libraries";
import { DateCondition } from "./conditions/DateCondition";
import { FileCondition } from "./conditions/FileCondition";
import { LookupCondition } from "./conditions/LookupCondition";
import { MultiSelectOptionSetCondition } from "./conditions/MultiSelectOptionSetCondition";
import { NumberCondition } from "./conditions/NumberCondition";
import { OptionSetCondition } from "./conditions/OptionSetCondition";
import { TextCondition } from "./conditions/TextCondition";
import { Condition } from "./conditions";

interface IDependencies {
    columnName: string;
    onGetDataset: () => IDataset;
}

export class ColumnFilter {
    private _conditions: Map<string, Condition> = new Map();
    private _column: IColumn;
    private _getDataset: () => IDataset;

    constructor({ columnName, onGetDataset }: IDependencies) {
        this._getDataset = onGetDataset;
        this._column = this._dataset.getDataProvider().getColumnsMap().get(columnName)!;
        this._createConditionsFromFilterExpression();
    }

    public isAppliedToDataset(): boolean {
        return !![...this._conditions.values()].find(cond => cond.isAppliedToDataset());
    }
    public getCondition(id: string) {
        return this._conditions.get(id);
    }
    public getConditions(): Condition[] {
        return [...this._conditions.values()];
    }
    public addCondition() {
        const id = crypto.randomUUID();
        const ConditionClass = this._getConditionClass();
        const condition = new ConditionClass({ id, column: this._column });
        this._conditions.set(id, condition);
    }

    public clear() {
        this._conditions.clear();
    }

    public getExpressionConditions(): ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression[] {
        const attributeName = Attribute.GetNameFromAlias(this._column.name);
        const entityAlias = Attribute.GetLinkedEntityAlias(this._column.name) ?? '';
        return [...this._conditions.values()].map(cond => {
            return {
                attributeName: this._decorateAttributeName(attributeName, cond.getOperator()),
                entityAliasName: entityAlias,
                conditionOperator: cond.getOperator(true),
                value: cond.getValue(true) ?? ''
            }
        })
    }

    private _createConditionsFromFilterExpression() {
        const conditions = this._dataset.filtering.getFilter()?.conditions ?? [];
        conditions.map(cond => {
            const attributeName = this._undecorateAttributeName(cond.attributeName, cond.conditionOperator);
            const alias = cond.entityAliasName ? `${cond.entityAliasName}.${attributeName}` : attributeName;
            const ConditionClass = this._getConditionClass();
            const id = crypto.randomUUID();
            if (alias === this._column.name) {
                const condition = new ConditionClass({ id, column: this._column, condition: cond });
                this._conditions.set(id, condition);
            }
        });
    }

    private _getConditionClass() {
        switch (this._column.dataType) {
            case DataTypes.DateAndTimeDateAndTime:
            case DataTypes.DateAndTimeDateOnly: {
                return DateCondition;
            }
            case DataTypes.WholeDuration:
            case DataTypes.Decimal:
            case DataTypes.WholeTimeZone:
            case DataTypes.WholeNone:
            case DataTypes.WholeLanguage:
            case DataTypes.Currency: {
                return NumberCondition;
            }
            case DataTypes.File:
            case DataTypes.Image: {
                return FileCondition;
            }
            case DataTypes.MultiSelectOptionSet: {
                return MultiSelectOptionSetCondition;
            }
            case DataTypes.OptionSet:
            case DataTypes.TwoOptions: {
                return OptionSetCondition;
            }
            case DataTypes.LookupCustomer:
            case DataTypes.LookupOwner:
            case DataTypes.LookupRegarding:
            case DataTypes.LookupSimple: {
                return LookupCondition;
            }
            default: {
                return TextCondition;
            }
        }
    }

    private _undecorateAttributeName(attributeName: string, operator: IOperator['Value']): string {
        switch (this._column.dataType) {
            case DataTypes.LookupCustomer:
            case DataTypes.LookupOwner:
            case DataTypes.LookupRegarding:
            case DataTypes.LookupSimple:
            case DataTypes.OptionSet:
            case DataTypes.TwoOptions: {
                if (this._isDecoratableOperator(operator)) {
                    if (attributeName.endsWith('name')) {
                        return attributeName.slice(0, -4);
                    }
                }
                return attributeName;
            }
        }
        return attributeName;
    }

    private _decorateAttributeName(attributeName: string, operator: IOperator['Value']): string {
        switch (this._column.dataType) {
            case DataTypes.LookupCustomer:
            case DataTypes.LookupOwner:
            case DataTypes.LookupRegarding:
            case DataTypes.LookupSimple:
            case DataTypes.OptionSet:
            case DataTypes.TwoOptions: {
                if (this._isDecoratableOperator(operator)) {
                    return `${attributeName}name`;
                }
                return attributeName;
            }
        }
        return attributeName;
    }

    private _isDecoratableOperator(operator: IOperator['Value']) {
        const decoratableOperators = [
            Operators.Like.Value,
            Operators.NotLike.Value,
            Operators.BeginsWith.Value,
            Operators.DoesNotBeginWith.Value,
            Operators.EndsWith.Value,
            Operators.DoesNotEndWith.Value
        ];
        return decoratableOperators.includes(operator);
    }

    private get _dataset() {
        return this._getDataset();
    }

}