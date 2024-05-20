import isNumeric from "validator/lib/isNumeric";
import isEmail from "validator/lib/isEmail";
import isMobilePhone from "validator/lib/isMobilePhone";
import isURL from "validator/lib/isURL";
import dayjs from "dayjs";
import { DataType } from "../../core/enums/DataType";
import { IGridColumn } from "../../core/interfaces/IGridColumn";

export class ColumnValidation {
    private _column: IGridColumn;
    private _forceNullCheck: boolean;
    
    constructor(column: IGridColumn, forceNullCheck?: boolean) {
        this._column = column;
        this._forceNullCheck = forceNullCheck ?? false;
    }
    public validate(value: any): [boolean, string] {
        const isNull = this._isNull(value);
        if((this._column.isRequired || this._forceNullCheck)) {
            if(isNull) {
                return [false, 'I need an input!']
            }
        }
        //can be null
        else if(isNull) {
            return [true, ""]
        }
        switch (this._column.dataType) {
            case DataType.WHOLE_NONE:
            case DataType.DECIMAL:
            case DataType.CURRENCY: {
                value = `${value}`;
                if (!isNumeric(value)) {
                    return [false, 'Invalid input!'];
                }
                break;
            }
            case DataType.SINGLE_LINE_EMAIL: {
                value = `${value}`;
                if (!isEmail(value)) {
                    return [false, 'Invalid format!']
                }
                break;
            }
            case DataType.SINGLE_LINE_PHONE: {
                value = `${value}`;
                if (!isMobilePhone(value)) {
                    return [false, 'Invalid format!']
                }
                break;
            }
            case DataType.SINGLE_LINE_URL: {
                value = `${value}`;
                if (!isURL(value)) {
                    return [false, 'Invalid format!']
                }
                break;
            }
            case DataType.DATE_AND_TIME_DATE_AND_TIME:
            case DataType.DATE_AND_TIME_DATE_ONLY: {
                const date = dayjs(value);
                if(!date.isValid()) {
                    return [false, 'Invalid format!']
                }
                break;
            }
            default: {
                if(!value) {
                    return [false, 'Input needed!']
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
}