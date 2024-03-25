import { IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { IInputStaticParameters } from "../../interfaces/bindings";
import { IComponent, IOutputs } from "../../interfaces/context";

export interface ITextField extends IComponent<ITextFieldParameters, ITextFieldOutputs> {
}

interface ITextFieldParameters extends IInputStaticParameters {
    IsMultiLine?: ITwoOptionsProperty;
    value: IStringProperty;
}

interface ITextFieldOutputs extends IOutputs {
    value?: string;
}