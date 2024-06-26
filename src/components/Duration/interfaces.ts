import { IWholeNumberProperty } from "../../interfaces";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";
import { IBaseParameters, IInputParameters } from "../../interfaces/parameters";

export interface IDuration extends IComponent<IDurationParameters, IDurationOutputs, IDurationTranslations> {
}

export interface IDurationParameters extends IInputParameters {
    value: IWholeNumberProperty;
}

export interface IDurationOutputs extends IOutputs {
    value?: number
}
export interface IDurationTranslations extends ITranslations {
    minute?: {[LCID: number]: string []}
    minutes?: {[LCID: number]: string[]}
    hour?: {[LCID: number]: string[]}
    hours?: {[LCID: number]: string[]}
    day?: {[LCID: number]: string[]}
    days?: {[LCID: number]: string[]}
}