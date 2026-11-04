import { IComboBoxProps } from "@legacy";
import { IOptionSetProperty, ITwoOptionsProperty } from "@pcf/interfaces";
import { IControl, IOutputs } from "@pcf/interfaces/context";
import { IInputParameters } from "@pcf/interfaces/parameters";

export interface IOptionSet extends IControl<IOptionSetParameters, IOptionSetOutputs, IComboBoxProps> {
}

export interface IOptionSetParameters extends IInputParameters {
    value: IOptionSetProperty;
    EnableOptionSetColors?: Omit<ITwoOptionsProperty, 'attributes'>;
}

export interface IOptionSetOutputs extends IOutputs {
    value?: number
}