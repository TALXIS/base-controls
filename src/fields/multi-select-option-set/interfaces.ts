import { IComboBoxProps } from "@legacy";
import { IMultiSelectOptionSetProperty, ITwoOptionsProperty } from "@core/pcf/interfaces";
import { IControl, IOutputs } from "@core/pcf/interfaces/context";
import { IInputParameters } from "@core/pcf/interfaces/parameters";

export interface IMultiSelectOptionSet extends IControl<IMultiSelectOptionSetParameters, IMultiSelectOptionSetOutputs, IComboBoxProps> {
}

export interface IMultiSelectOptionSetParameters extends IInputParameters {
    value: IMultiSelectOptionSetProperty;
    EnableOptionSetColors?: Omit<ITwoOptionsProperty, 'attributes'>;
}

export interface IMultiSelectOptionSetOutputs extends IOutputs {
    value?: number[];
}
