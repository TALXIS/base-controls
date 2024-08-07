import { IDecimalNumberProperty, ITwoOptionsProperty } from "../../interfaces";
import { IInputParameters } from "../../interfaces/parameters";
import { IControl, IOutputs } from "../../interfaces/context";
import { ITextFieldProps } from "@talxis/react-components";

export interface IDecimal extends IControl<IDecimalParameters, IDecimalOutputs, any, ITextFieldProps> {
    
}

export interface IDecimalParameters extends IInputParameters {
    //bound parameter
    value: IDecimalNumberProperty;
    EnableSpinButton?: Omit<ITwoOptionsProperty, 'attributes'>;
}

export interface IDecimalOutputs extends IOutputs {
    value?: number;
}