import isNumeric from "validator/lib/isNumeric";
import isEmail from "validator/lib/isEmail";
import isURL from "validator/lib/isURL";
import dayjs from "dayjs";
import { DataType } from "../../core/enums/DataType";
import { IGridColumn } from "../../core/interfaces/IGridColumn";
import { GridDependency } from "../../core/model/GridDependency";
import { Grid } from "../../core/model/Grid";

export class ColumnValidation extends GridDependency {
    private _column: IGridColumn;
    private _forceNullCheck: boolean;
    
    constructor(grid: Grid, column: IGridColumn, forceNullCheck?: boolean) {
        super(grid);
        this._column = column;
        this._forceNullCheck = forceNullCheck ?? false;
    }
    public validate(value: any): [boolean, string] {
        const isNull = this._isNull(value);
        if((this._column.isRequired || this._forceNullCheck)) {
            if(isNull) {
                return [false, this._labels["validation-input-value"]()]
            }
        }
        //can be null
        else if(isNull) {
            return [true, ""]
        }
        switch (this._column.dataType) {
            case DataType.WHOLE_NONE:
            case DataType.DECIMAL:
            case DataType.CURRENCY:
            {
                value = `${value}`;
                if (!isNumeric(value)) {
                    return [false, 'Invalid input!'];
                }
                break;
            }
            case DataType.SINGLE_LINE_EMAIL: {
                value = `${value}`;
                if (!isEmail(value)) {
                    return [false, this._labels["validation-email"]()]
                }
                break;
            }
            case DataType.SINGLE_LINE_URL: {
                value = `${value}`;
                if (!isURL(value)) {
                    return [false, this._labels["validation-url"]()]
                }
                break;
            }
            case DataType.DATE_AND_TIME_DATE_AND_TIME:
            case DataType.DATE_AND_TIME_DATE_ONLY: {
                const date = dayjs(value);
                if(!date.isValid()) {
                    return [false, this._labels["validation-date"]()]
                }
                break;
            }
            default: {
                if(!value) {
                    return [false, this._labels["validation-input-value"]()]
                }
            }
        }
        return [true, ""];
    }
    private _isNull(value: any) {
        if(!value) {
            return true;
        }
        if(value?.length === 0) {
            return true;
        }
    }
    private get _labels() {
        return this._grid.labels;
    }
}