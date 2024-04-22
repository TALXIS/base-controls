import { IMultiSelectOptionSetProperty } from "../../interfaces";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";
import { IBaseParameters } from "../../interfaces/parameters";

export interface IMultiSelectOptionSet extends IComponent<IMultiSelectOptionSetParameters, IMultiSelectOptionSetOutputs, ITranslations> {
}

export interface IMultiSelectOptionSetParameters extends IBaseParameters {
    value: IMultiSelectOptionSetProperty;
}

export interface IMultiSelectOptionSetOutputs extends IOutputs {
    value?: number[];
}
