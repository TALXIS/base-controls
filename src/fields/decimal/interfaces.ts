import { IDecimalNumberProperty, ITwoOptionsProperty } from "@pcf/interfaces";
import { IInputParameters } from "@pcf/interfaces/parameters";
import { IControl, IOutputs } from "@pcf/interfaces/context";
import { ITextFieldProps } from "@legacy";

export interface IDecimal extends IControl<IDecimalParameters, IDecimalOutputs, ITextFieldProps> {
    
}

export interface IDecimalParameters extends IInputParameters {
    //bound parameter
    value: IDecimalNumberProperty;
    EnableSpinButton?: Omit<ITwoOptionsProperty, 'attributes'>;
}

export interface IDecimalOutputs extends IOutputs {
    value?: number;
}