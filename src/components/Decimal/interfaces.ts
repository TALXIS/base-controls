import { IDecimalNumberProperty, ITwoOptionsProperty } from "../../interfaces";
import { IInputParameters } from "../../interfaces/parameters";
import { IComponent, IOutputs } from "../../interfaces/context";

export interface IDecimal extends IComponent<IDecimalParameters, IDecimalOutputs, any> {
    
}

export interface IDecimalParameters extends IInputParameters {
    //bound parameter
    value: IDecimalNumberProperty;
    EnableSpinButton?: ITwoOptionsProperty;
}

export interface IDecimalOutputs extends IOutputs {
    value?: number;
}