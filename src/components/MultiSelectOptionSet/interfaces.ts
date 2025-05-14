import { IComboBoxProps } from "@talxis/react-components";
import { IMultiSelectOptionSetProperty, ITwoOptionsProperty } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { IInputParameters } from "../../interfaces/parameters";

export interface IMultiSelectOptionSet extends IControl<IMultiSelectOptionSetParameters, IMultiSelectOptionSetOutputs, any, IComboBoxProps> {
}

export interface IMultiSelectOptionSetParameters extends IInputParameters {
    value: IMultiSelectOptionSetProperty;
    EnableMultiSelectOptionSetColors?: Omit<ITwoOptionsProperty, 'attributes'>;
}

export interface IMultiSelectOptionSetOutputs extends IOutputs {
    value?: number[];
}
