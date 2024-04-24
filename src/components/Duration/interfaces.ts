import { IWholeNumberProperty } from "../../interfaces";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";
import { IBaseParameters } from "../../interfaces/parameters";

export interface IDuration extends IComponent<IDurationParameters, IDurationOutputs, IDurationTranslations> {
}

export interface IDurationParameters extends IBaseParameters {
    value: IWholeNumberProperty;
}

export interface IDurationOutputs extends IOutputs {
    value?: number
}
export interface IDurationTranslations extends ITranslations {

}