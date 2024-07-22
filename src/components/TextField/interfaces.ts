import { ITextFieldProps } from "@talxis/react-components";
import { IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { IInputParameters } from "../../interfaces/parameters";

export interface ITextField extends IControl<ITextFieldParameters, ITextFieldOutputs, any, ITextFieldProps> {
}

export interface ITextFieldParameters extends IInputParameters {
    isResizable?: ITwoOptionsProperty;
    EnableTypeSuffix?: ITwoOptionsProperty;
    value: IStringProperty;
}

export interface ITextFieldOutputs extends IOutputs {
    value?: string;
}