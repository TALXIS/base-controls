import { IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { IInputStaticParameters } from "../../interfaces/parameters";
import { IComponent, IOutputs } from "../../interfaces/context";

export interface ITextField extends IComponent<ITextFieldParameters, ITextFieldOutputs> {
}

export interface ITextFieldParameters extends IInputStaticParameters {
    IsMultiLine?: ITwoOptionsProperty;
    value: IStringProperty;
}

export interface ITextFieldOutputs extends IOutputs {
    value?: string;
}