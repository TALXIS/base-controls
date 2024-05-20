import dayjs from "dayjs";
import { DatasetConditionOperator } from "../../../../../../core/enums/ConditionOperator";
import { DataType } from "../../../../../../core/enums/DataType";
import { IColumnFilterConditionController } from "../../../../../controller/useColumnFilterConditionController";
import { FilteringUtils } from "../../../../../utils/FilteringUtilts";

export class ConditionComponentValue {
    //needs to be ref to keep the current reference
    private _columnFilterConditionControllerRef: React.MutableRefObject<IColumnFilterConditionController>;
    private _conditionUtils = FilteringUtils.condition();

    constructor(columnFilterConditionControllerRef: React.MutableRefObject<IColumnFilterConditionController>) {
        this._columnFilterConditionControllerRef = columnFilterConditionControllerRef;
    }

    public get column() {
        const _column = {...this._columnFilterConditionController.column};
        //always needs to be required for filter values if non valid value is present
        if(!this._columnFilterConditionController.value.valid) {
            _column.isRequired = true;
        }
        switch (this._columnFilterConditionController.column.dataType) {
            case DataType.OPTIONSET:
            case DataType.TWO_OPTIONS: {
                _column.dataType = DataType.MULTI_SELECT_OPTIONSET;
                break;
            }
            //In Power Apps, DateTime fields filters do not allow setting filters for time, only for the date
            case DataType.DATE_AND_TIME_DATE_AND_TIME: {
                _column.dataType = DataType.DATE_AND_TIME_DATE_ONLY;
                break;
            }
        }
        this._conditionUtils.operator(this._operator.get()).allowsOnlyNumber
        if (this._conditionUtils.operator(this._operator.get()).allowsOnlyNumber) {
            _column.dataType = DataType.WHOLE_NONE;
        }
        if (this._conditionUtils.operator(this._operator.get()).allowsOnlyFreeText) {
            _column.dataType = DataType.SINGLE_LINE_TEXT;
        }
        return _column;
    }
    public get() {
        let value = this._value.get();
        if (!value) {
            return null;
        }
        switch (this.column.dataType) {
            case DataType.MULTI_SELECT_OPTIONSET: {
                if (typeof value === 'string') {
                    value = [value];
                }
                return value.map((x: string) => parseInt(x))
            }
            case DataType.LOOKUP_OWNER:
            case DataType.LOOKUP_SIMPLE: {
                if (typeof value === 'string') {
                    value = [value];
                }
                return value.map((x: string) => {
                    return {
                        entityType: "",
                        name: "",
                        id: x
                    } as ComponentFramework.LookupValue;
                })
            }
        }
        return value;
    }
    public set(value: any) {
        switch (this.column.dataType) {
            case DataType.DATE_AND_TIME_DATE_AND_TIME:
            case DataType.DATE_AND_TIME_DATE_ONLY: {
                if(value instanceof Date) {

                     //the column of date time is always converted to Date column in Power Apps
                     value = dayjs(value).format('YYYY-MM-DD');
                }
                break;
            }
            case DataType.MULTI_SELECT_OPTIONSET: {
                switch (this._operator.get()) {
                    case DatasetConditionOperator.Equal:
                    case DatasetConditionOperator.NotEqual: {
                        if (value?.length === 1) {
                            value = value[0].toString();
                            this._value.set(value);
                            return;
                        }
                    }
                }
                for (let i = 0; i < value?.length; i++) {
                    value[i] = value[i].toString()
                }
                this._value.set(value);
                return;
            }
            case DataType.LOOKUP_OWNER:
            case DataType.LOOKUP_SIMPLE: {
                if(value?.length > 1) {
                    value = value.map((x: ComponentFramework.LookupValue) => x.id);
                    break;
                }
                value = value[0]?.id;
            }

        }
        this._value.set(value);
    }
    private get _columnFilterConditionController() {
        return this._columnFilterConditionControllerRef.current;
    }
    private get _value() {
        return this._columnFilterConditionController.value;
    }
    private get _operator() {
        return this._columnFilterConditionController.operator;
    }
}