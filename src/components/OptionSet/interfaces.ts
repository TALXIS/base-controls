import { IOptionSetProperty } from "../../interfaces";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";
import { IBaseParameters } from "../../interfaces/parameters";

export interface IOptionSet extends IComponent<IOptionSetParameters, IOptionSetOutputs, IOptionSetTranslations> {
}

export interface IOptionSetParameters extends IBaseParameters {
    value: IOptionSetProperty;
}

export interface IOptionSetOutputs extends IOutputs {
    value?: number
}
export interface IOptionSetTranslations extends ITranslations {

}