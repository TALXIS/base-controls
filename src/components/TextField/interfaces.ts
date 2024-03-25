import { IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { IComponent, IOutputs } from "../../interfaces/context";
import { IInputParameters } from "../../interfaces/parameters";

export interface ITextField extends IComponent<ITextFieldParameters, ITextFieldOutputs> {
}

export interface ITextFieldParameters extends IInputParameters {
    IsMultiLine?: ITwoOptionsProperty;
    value: IStringProperty;
}

export interface ITextFieldOutputs extends IOutputs {
    value?: string;
}