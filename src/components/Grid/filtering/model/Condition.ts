import { Attribute, MemoryDataProvider } from "@talxis/client-libraries";
import { DatasetConditionOperator } from "../../core/enums/ConditionOperator";
import { DataType } from "../../core/enums/DataType";
import { IGridColumn } from "../../core/interfaces/IGridColumn";
import { Grid } from "../../core/model/Grid";
import { GridDependency } from "../../core/model/GridDependency";
import { FilteringUtils } from "../utils/FilteringUtilts";
import dayjs from "dayjs";

export class Condition extends GridDependency {
    private _column: IGridColumn;
    private _conditionExpression: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression = {} as any;
    private _isRemoved?: boolean;
    private _conditionUtils = FilteringUtils.condition();
    private _isValid: boolean = true;
    private _inicializationPromise: Promise<boolean> | undefined;
    private _initialized: boolean = false;
    private _shouldShowError: boolean = false;

    constructor(grid: Grid, column: IGridColumn) {
        super(grid);
        this._column = {...column};
        switch(this._column.dataType) {
            //this will skip regex validation since it is not desirable during filtering (we have contains and stuff)
            case DataType.SINGLE_LINE_EMAIL:
            case DataType.SINGLE_LINE_URL: {
                this._column.dataType = DataType.SINGLE_LINE_TEXT;
            }
        }
        return new Proxy(this, {
            get: (target, prop) => {
                if(prop !== 'init') {
                    if(!target._initialized) {
                        throw new Error('Condition has not been initialized. Make sure to call the init() method on the condition object before any operations.')
                    }
                }
                //@ts-ignore
                if (typeof target[prop] === 'function') {
                    //@ts-ignore
                    return target[prop].bind(target);
                }
                //@ts-ignore
                return target[prop];
            }
        })
    }
    public async init() {
        if (!this._inicializationPromise) {
            this._inicializationPromise = new Promise(async (resolve) => {
                const [map, key] = await this._getConditionFromFilterExpression();
                if(!key) {
                    this._conditionExpression = this._getDefault();
                }
                else {
                    this._conditionExpression = map.get(key)!;
                }
                this._conditionExpression.conditionOperator = this._operatorDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.value, true) as any;
                this._conditionExpression.value = this._valueDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.value, true);
                this._conditionExpression.attributeName = await this._attributeNameDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.attributeName, true);
                resolve(true);
                this._initialized = true;
            })
        }
        return this._inicializationPromise;
    }
    public get isRemoved() {
        return this._isRemoved;
    }

    public get column() {
        return this._column;
    }

    public get isAppliedToDataset() {
        return !!this._dataset.filtering.getFilter()?.conditions.find(cond => {
            const attributeName = cond.entityAliasName ? `${cond.entityAliasName}.${cond.attributeName}` : cond.attributeName;
            if(attributeName === this._column.name) {
                return true;
            }
            if(attributeName === `${this._column.name}name`) {
                return true;
            }
            return false;
        })
    }

    public get isValid() {
        return this._isValid;
    }

    public setShouldShowError(value: boolean) {
        this._shouldShowError = value;
    }

    public shouldShowError() {
        return this._shouldShowError;
    }

    public async getExpression() {
        const result = { ...this._conditionExpression };
        result.conditionOperator = this._operatorDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.value) as any;
        result.value = this._valueDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.value);
        result.attributeName = await this._attributeNameDecorator(this._conditionExpression.conditionOperator, this._conditionExpression.attributeName);
        return result;

    }
    public async save(): Promise<boolean> {
        this._shouldShowError = true;
        if (!await this.value.isValid()) {
            this._isValid = false;
            this._triggerRefreshCallbacks();
            return false;
        }
        const filterExpression = this._filterExpression;
        if (this.isAppliedToDataset || this._isRemoved) {
            const [map, key] = await this._getConditionFromFilterExpression();
            map.delete(key);
            filterExpression.conditions = [...map.values()];
        }
        if (!this._isRemoved) {
            filterExpression.conditions.push(await this.getExpression());
        }
        this._dataset.filtering.setFilter(filterExpression);
        return true;

    }
    public remove() {
        this._isRemoved = true;
    }
    public clear() {
        this._inicializationPromise = undefined;
    }
    public get operator() {
        return {
            get: () => this._get('operator') as DatasetConditionOperator,
            set: (conditionOperator: DatasetConditionOperator) => {
                const previousOperator = this._conditionExpression.conditionOperator
                this._set("operator", conditionOperator, null);
                const isCurrentEditable = this._conditionUtils.value(conditionOperator).isManuallyEditable;
                const isPreviousEditable = this._conditionUtils.value(previousOperator).isManuallyEditable;

                if (isCurrentEditable !== isPreviousEditable) {
                    // we are transitioning between editable and non-editable operators and the value of these data types needs to be set to null
                    // to prevent type incompability
                    switch (this._column.dataType) {
                        case DataType.MULTI_SELECT_OPTIONSET:
                        case DataType.OPTIONSET:
                        case DataType.TWO_OPTIONS:
                        case DataType.LOOKUP_SIMPLE:
                        case DataType.LOOKUP_OWNER:
                        case DataType.LOOKUP_CUSTOMER:
                        case DataType.DATE_AND_TIME_DATE_AND_TIME:
                        case DataType.DATE_AND_TIME_DATE_ONLY: {
                            this._conditionExpression!.value = ""
                            break;
                        }
                    }
                }
                //@ts-ignore - going from between/not between to other operators
                if((previousOperator === DatasetConditionOperator.Between || previousOperator === DatasetConditionOperator.NotBetween) && (conditionOperator !== DatasetConditionOperator.Between && conditionOperator !== DatasetConditionOperator.NotBetween)) {
                    this._conditionExpression.value = "";
                }
                //@ts-ignore - going from other operators to between/not between
                if((conditionOperator === DatasetConditionOperator.Between || conditionOperator === DatasetConditionOperator.NotBetween) && (previousOperator !== DatasetConditionOperator.Between && previousOperator !== DatasetConditionOperator.NotBetween)) {
                    this._conditionExpression.value = []
                }
            },
        }
    }

    public get value() {
        return {
            get: () => this._get('value') as any,
            set: (value: any) => this._set("value", undefined, value),
            isValid: async () => {
                if(this._conditionUtils.operator(this.operator.get()).doesNotAllowValue) {
                    return true;
                }
                const operator = this.operator.get();
                if(operator === DatasetConditionOperator.Between || operator === DatasetConditionOperator.NotBetween) {
                    // undefined causes dayjs to use today
                    const date1 = dayjs(this.value.get()?.[0] ?? '---');
                    const date2 = dayjs(this.value.get()?.[1] ?? '---');
                    if(date1.isValid() && date2.isValid()) {
                        return true;
                    }
                    return false;
                }
                const memoryProvider = new MemoryDataProvider([{
                    id: 'id',
                    [this._column.name]: await this.value.get() ?? undefined
                }], {PrimaryIdAttribute: "id"})
                memoryProvider.setColumns([{...this._column, metadata: {...this._column.metadata as any, RequiredLevel: 0}}, {
                    name: 'id',
                    displayName: '',
                    dataType: DataType.SINGLE_LINE_TEXT,
                    alias: 'id',
                    order: 0,
                    visualSizeFactor: 0
                }]);
                const record = memoryProvider.refreshSync()[0];
                record.expressions?.setRequiredLevelExpression(this._column.name, () => 'required');
                return !record.getColumnInfo(this._column.name).error
            }
        }
    }
    private _get(type: 'operator' | 'value'): DatasetConditionOperator | any {
        if (type === 'operator') {
            return this._conditionExpression.conditionOperator;
        }
        return this._conditionExpression.value;
    }
    private _set(type: 'operator' | 'value', conditionOperator?: DatasetConditionOperator, value?: any) {
        this._isValid = true;
        if (type === 'operator') {
            this._conditionExpression.conditionOperator = conditionOperator as any;
        }
        else {
            this._conditionExpression.value = value;
        }
        this._triggerRefreshCallbacks();
    }

    private async _attributeNameDecorator(conditionOperator: DatasetConditionOperator, attributeName: string, undecorate?: boolean) {
        if (!this._conditionUtils.value(conditionOperator).isManuallyEditable) {
            return attributeName;
        }
        switch (this._column.dataType) {
            case DataType.OPTIONSET:
            case DataType.TWO_OPTIONS:
            case DataType.LOOKUP_OWNER:
            case DataType.LOOKUP_SIMPLE:
            case DataType.LOOKUP_CUSTOMER: {
                if (undecorate) {
                    if (attributeName.endsWith('name')) {
                        return attributeName.slice(0, -4);
                    }
                    return attributeName;
                }
                if (attributeName.endsWith('name')) {
                    return attributeName;
                }
                return `${attributeName}name`
            }
            default: {
                return attributeName;
            }
        }
    }
    private _valueDecorator(conditionOperator: DatasetConditionOperator, value: any, undecorate?: boolean) {
        switch (conditionOperator) {
            case DatasetConditionOperator.BeginWith:
            case DatasetConditionOperator.DoesNotBeginWith: {
                if (undecorate) {
                    return value.slice(0, -1);
                }
                return `${value}%`;
            }
            case DatasetConditionOperator.EndsWith:
            case DatasetConditionOperator.DoesNotEndWith: {
                if (undecorate) {
                    return value.slice(1)
                }
                return `%${value}`;
            }
            case DatasetConditionOperator.Like:
            case DatasetConditionOperator.NotLike: {
                if (undecorate) {
                    return value.slice(1, -1)
                }
                return `%${value}%`;
            }
            default: {
                return value;
            }
        }
    }

    private _operatorDecorator(conditionOperator: DatasetConditionOperator, value: any, undecorate?: boolean): DatasetConditionOperator {
        switch (this._column.dataType) {
            case DataType.MULTI_SELECT_OPTIONSET:
            case DataType.OPTIONSET:
            case DataType.TWO_OPTIONS:
            case DataType.LOOKUP_OWNER:
            case DataType.LOOKUP_SIMPLE:
            case DataType.LOOKUP_CUSTOMER: {
                //we need to switch the operators based on the number of selected options
                if (typeof value !== 'string') {
                    if(undecorate) {
                        switch(conditionOperator) {
                            case DatasetConditionOperator.In: {
                                return DatasetConditionOperator.Equal
                            }
                            case DatasetConditionOperator.NotIn: {
                                return DatasetConditionOperator.NotEqual;
                            }
                        }
                    }
                    switch (conditionOperator) {
                        case DatasetConditionOperator.Equal: {
                            return DatasetConditionOperator.In;
                        }
                        case DatasetConditionOperator.NotEqual: {
                            return DatasetConditionOperator.NotIn;
                        }
                    }
                }
                else {
                    switch (conditionOperator) {
                        case DatasetConditionOperator.In: {
                            return DatasetConditionOperator.Equal;
                        }
                        case DatasetConditionOperator.NotIn: {
                            return DatasetConditionOperator.NotEqual;
                        }
                    }
                }
            }
        }
        return conditionOperator;
    }

    private _getDefault(): ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression {
        const entityAliasName = Attribute.GetLinkedEntityAlias(this._column.name);
        const attributeName = Attribute.GetNameFromAlias(this._column.name);
        const cond: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression = {
            attributeName: attributeName,
            conditionOperator: DatasetConditionOperator.Equal,
            entityAliasName: entityAliasName ?? "",
            value: ""
        }
        switch (this._column.dataType) {
            case DataType.DATE_AND_TIME_DATE_AND_TIME:
            case DataType.DATE_AND_TIME_DATE_ONLY: {
                cond.conditionOperator = DatasetConditionOperator.On;
                break;
            }
            case DataType.IMAGE:
            case DataType.FILE: {
                cond.conditionOperator = DatasetConditionOperator.NotNull as any;
                break;
            }
        }
        return cond;
    }
    private get _filterExpression() {
        return structuredClone(this._dataset.filtering.getFilter()) ?? {
            conditions: [],
            filterOperator: 0
        }
    }
    private async  _getConditionFromFilterExpression(): Promise<[Map<string, ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression>, string]> {
        const map = new Map<string, ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression>(this._filterExpression.conditions.map(x => [x.attributeName, x]));
        const attributeName = Attribute.GetNameFromAlias(this._column.name);
        for (const cond of map.values()) {
            const conditionAttributeName = await this._attributeNameDecorator(cond.conditionOperator, cond.attributeName, true);
            if(conditionAttributeName === attributeName) {
                return [map, cond.attributeName]
            }
        }
        return [map, ""];
    }
}