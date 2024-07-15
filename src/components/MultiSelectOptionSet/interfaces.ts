import { IMultiSelectOptionSetProperty } from "../../interfaces";
import { IComponent, IOutputs } from "../../interfaces/context";
import { IInputParameters } from "../../interfaces/parameters";

export interface IMultiSelectOptionSet extends IComponent<IMultiSelectOptionSetParameters, IMultiSelectOptionSetOutputs, any> {
}

export interface IMultiSelectOptionSetParameters extends IInputParameters {
    value: IMultiSelectOptionSetProperty;
}

export interface IMultiSelectOptionSetOutputs extends IOutputs {
    value?: number[];
}
