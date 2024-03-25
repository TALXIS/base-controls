import { TextField } from "@talxis/react-components";
import { useInputBasedComponent } from "../../hooks/useInputBasedComponent";
import { IDecimal, IDecimalOutputs, IDecimalParameters } from "./interfaces";
import React from 'react';

export const Decimal = (props: IDecimal) => {
    const [value, setValue, onNotifyOutputChanged] = useInputBasedComponent<number, IDecimalParameters, IDecimalOutputs>(props);
    return <TextField />
}