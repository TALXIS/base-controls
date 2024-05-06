import { IParameters } from "../../../../../interfaces/parameters";
import { DateTime } from "../../../../DateTime/DateTime";
import { Decimal } from "../../../../Decimal/Decimal";
import { Lookup } from "../../../../Lookup/Lookup";
import { MultiSelectOptionSet } from "../../../../MultiSelectOptionSet/MultiSelectOptionSet";
import { OptionSet } from "../../../../OptionSet/OptionSet";
import { TextField } from "../../../../TextField/TextField";
import { TwoOptions } from "../../../../TwoOptions/TwoOptions";
import { DataType } from "../../enums/DataType";
import { IGridColumn } from "../../interfaces/IGridColumn";
import { useComponentController } from "./controller/useComponentController";

export interface IComponentProps {
    column: IGridColumn;
    value: any;
    onNotifyOutputChanged: (value: any) => void;
    shouldValidate?: boolean;
    additionalParameters?: IParameters;
}

export const Component = (props: IComponentProps) => {
    const {column} = {...props};
    const controlProps = useComponentController(props);

    if(!controlProps) {
        return <></>
    }
    switch(column.dataType) {
        case DataType.TWO_OPTIONS: {
            return <TwoOptions {...controlProps} />
        }
        case DataType.OPTIONSET: {
            return <OptionSet {...controlProps} />
        }
        case DataType.MULTI_SELECT_OPTIONSET: {
            return <MultiSelectOptionSet {...controlProps} />
        }
        case DataType.DATE_AND_TIME_DATE_AND_TIME:
        case DataType.DATE_AND_TIME_DATE_ONLY: {
            return <DateTime {...controlProps} />
        }
        case DataType.DECIMAL:
        case DataType.WHOLE_NONE: {
            return <Decimal {...controlProps} />
        }
        case DataType.LOOKUP_SIMPLE:
        case DataType.LOOKUP_OWNER: {
            return <Lookup {...controlProps} />
        }
        default: {
            return <TextField {...controlProps} />
        }
    }
}