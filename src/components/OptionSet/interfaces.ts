import { IOptionSetProperty } from "../../interfaces";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";
import { IBaseParameters, IInputParameters } from "../../interfaces/parameters";

export interface IOptionSet extends IComponent<IOptionSetParameters, IOptionSetOutputs, any> {
}

export interface IOptionSetParameters extends IInputParameters {
    value: IOptionSetProperty;
}

export interface IOptionSetOutputs extends IOutputs {
    value?: number
}