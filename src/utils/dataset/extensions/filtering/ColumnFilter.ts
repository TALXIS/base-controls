import { DateCondition } from "./conditions/DateCondition";
import { FileCondition } from "./conditions/FileCondition";
import { LookupCondition } from "./conditions/LookupCondition";
import { MultiSelectOptionSetCondition } from "./conditions/MultiSelectOptionSetCondition";
import { NumberCondition } from "./conditions/NumberCondition";
import { OptionSetCondition } from "./conditions/OptionSetCondition";
import { TextCondition } from "./conditions/TextCondition";
import { Condition } from "./conditions";
import { IDataProvider, Attribute, DataTypes, IOperator, Operators, IColumn } from "@talxis/client-libraries";
import { DataProviderExtension } from "../DataProviderExtension";

interface IDependencies {
    columnName: string;
    onGetDataProvider: () => IDataProvider;
}

export class ColumnFilter extends DataProviderExtension {
    private _conditions: Map<string, Condition> = new Map();
    private _columnName: string;

    constructor({ columnName, onGetDataProvider }: IDependencies) {
        super(onGetDataProvider);
        this._columnName = columnName;
        this._createConditionsFromFilterExpression();
        this._dataProvider.addEventListener('onBeforeNewDataLoaded', () => this._createConditionsFromFilterExpression())
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
    public addCondition(): Condition {
        const id = crypto.randomUUID();
        const ConditionClass = this._getConditionClass();
        const condition = new ConditionClass({ id, column: this._column });
        this._conditions.set(id, condition);
        return this._conditions.get(id)!;
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
        this._conditions.clear();
        const conditions = this._dataProvider.getFiltering()?.conditions ?? [];
        conditions.map(cond => {
            const attributeName = this._undecorateAttributeName(cond.attributeName, cond.conditionOperator);
            const alias = cond.entityAliasName ? `${cond.entityAliasName}.${attributeName}` : attributeName;
            const ConditionClass = this._getConditionClass();
            const id = `${alias}_${cond.conditionOperator}_${Array.isArray(cond.value) ? cond.value.join('_') : cond.value}`;
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

    private get _column(): IColumn {
        return this._dataProvider.getColumnsMap()[this._columnName]!;
    }
}