import { IDecimalNumberProperty } from "../../interfaces";
import { IInputParameters } from "../../interfaces/parameters";
import { IComponent, IOutputs } from "../../interfaces/context";

export interface IDecimal extends IComponent<IDecimalParameters, IDecimalOutputs> {
    
}

export interface IDecimalParameters extends IInputParameters {
    //bound parameter
    value: IDecimalNumberProperty;
}

export interface IDecimalOutputs extends IOutputs {
    value?: number;
}