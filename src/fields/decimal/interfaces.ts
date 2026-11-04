import { IDecimalNumberProperty, ITwoOptionsProperty } from "@core/pcf/interfaces";
import { IInputParameters } from "@core/pcf/interfaces/parameters";
import { IControl, IOutputs } from "@core/pcf/interfaces/context";
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