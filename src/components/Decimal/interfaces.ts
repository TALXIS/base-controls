import { IDecimalNumberProperty } from "../../interfaces";
import { IInputParameters } from "../../interfaces/parameters";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";

export interface IDecimal extends IComponent<IDecimalParameters, IDecimalOutputs, IDecimalTranslations> {
    
}

export interface IDecimalParameters extends IInputParameters {
    //bound parameter
    value: IDecimalNumberProperty;
}

export interface IDecimalOutputs extends IOutputs {
    value?: number;
}

export interface IDecimalTranslations extends ITranslations {

}