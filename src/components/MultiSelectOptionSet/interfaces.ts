import { IMultiSelectOptionSetProperty } from "../../interfaces";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";
import { IBaseParameters, IInputParameters } from "../../interfaces/parameters";

export interface IMultiSelectOptionSet extends IComponent<IMultiSelectOptionSetParameters, IMultiSelectOptionSetOutputs, ITranslations> {
}

export interface IMultiSelectOptionSetParameters extends IInputParameters {
    value: IMultiSelectOptionSetProperty;
}

export interface IMultiSelectOptionSetOutputs extends IOutputs {
    value?: number[];
}
