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
import React from 'react';

export interface IComponentProps {
    column: IGridColumn;
    value: any;
    onNotifyOutputChanged: (value: any) => void;
    shouldValidate?: boolean;
    additionalParameters?: IParameters;
}

export const Component = (props: IComponentProps) => {
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
        case DataType.WHOLE_NONE: {
            return <Decimal {...componentProps!} />
        }
        case DataType.LOOKUP_SIMPLE:
        case DataType.LOOKUP_OWNER: {
            return <Lookup {...componentProps!} />
        }
        default: {
            return <TextField {...componentProps!} />
        }
    }
}