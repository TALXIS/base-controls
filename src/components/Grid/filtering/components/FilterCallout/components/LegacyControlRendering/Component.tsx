import { IRecord } from "@talxis/client-libraries";
import { IControl } from "../../../../../../../interfaces";
import { DateTime } from "../../../../../../DateTime";
import { Decimal } from "../../../../../../Decimal";
import { Duration } from "../../../../../../Duration";
import { Lookup } from "../../../../../../Lookup";
import { MultiSelectOptionSet } from "../../../../../../MultiSelectOptionSet";
import { OptionSet } from "../../../../../../OptionSet";
import { TwoOptions } from "../../../../../../TwoOptions";
import { DataType } from "../../../../../core/enums/DataType";
import { IGridColumn } from "../../../../../core/interfaces/IGridColumn";
import { useComponentController } from "./controller/useComponentController";
import { TextField } from "../../../../../../TextField";

export interface IControlProps {
    column: IGridColumn;
    record: IRecord
    onNotifyOutputChanged: (value: any) => void;
    onOverrideControlProps?: (props: IControl<any, any, any, any>) => IControl<any, any, any, any>;
}

export const Component = (props: IControlProps) => {
    const controller = useComponentController(props);
    const {column, componentProps} = {...controller};
    if(!column) {
        return <></>
    }
    switch(column.dataType) {
        case DataType.TWO_OPTIONS: {
            return <TwoOptions {...componentProps!} />
        }
        case DataType.OPTIONSET: {
            return <OptionSet {...componentProps!} />
        }
        case DataType.MULTI_SELECT_OPTIONSET: {
            return <MultiSelectOptionSet {...componentProps!} />
        }
        case DataType.DATE_AND_TIME_DATE_AND_TIME:
        case DataType.DATE_AND_TIME_DATE_ONLY: {
            return <DateTime {...componentProps!} />
        }
        case DataType.DECIMAL:
        case DataType.WHOLE_NONE:
        case DataType.CURRENCY: {
            return <Decimal {...componentProps!} />
        }
        case DataType.LOOKUP_SIMPLE:
        case DataType.LOOKUP_OWNER:
        case DataType.LOOKUP_CUSTOMER: {
            return <Lookup {...componentProps!} />
        }
        case DataType.WHOLE_DURATION: {
            return <Duration {...componentProps!} />
        }
        default: {
            return <TextField {...componentProps!} />
        }
    }
}