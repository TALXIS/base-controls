import { IComboBoxProps } from "@talxis/react-components";
import { IOptionSetProperty, ITwoOptionsProperty } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { IInputParameters } from "../../interfaces/parameters";

export interface IOptionSet extends IControl<IOptionSetParameters, IOptionSetOutputs, any, IComboBoxProps> {
}

export interface IOptionSetParameters extends IInputParameters {
    value: IOptionSetProperty;
    EnableOptionSetColors?: Omit<ITwoOptionsProperty, 'attributes'>;
}

export interface IOptionSetOutputs extends IOutputs {
    value?: number
}