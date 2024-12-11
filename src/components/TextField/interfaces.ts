import { ITextFieldProps } from "@talxis/react-components";
import { IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { IInputParameters } from "../../interfaces/parameters";

export interface ITextField extends IControl<ITextFieldParameters, ITextFieldOutputs, any, ITextFieldProps> {
}

export interface ITextFieldParameters extends IInputParameters {
    isResizable?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableTypeSuffix?: Omit<ITwoOptionsProperty, 'attributes'>;
    value: IStringProperty;
}

export interface ITextFieldOutputs extends IOutputs {
    value?: string;
}