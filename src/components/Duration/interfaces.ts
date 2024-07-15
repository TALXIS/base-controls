import { IWholeNumberProperty } from "../../interfaces";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";
import { IInputParameters } from "../../interfaces/parameters";
import { getDefaultDurationTranslations } from "./translations";

export interface IDuration extends IComponent<IDurationParameters, IDurationOutputs, Partial<ITranslations<ReturnType<typeof getDefaultDurationTranslations>>>> {
}

export interface IDurationParameters extends IInputParameters {
    value: IWholeNumberProperty;
}

export interface IDurationOutputs extends IOutputs {
    value?: number
}