import { IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";
import { IInputParameters } from "../../interfaces/parameters";

export interface ITextField extends IComponent<ITextFieldParameters, ITextFieldOutputs, ITextFieldTranslations> {
}

export interface ITextFieldParameters extends IInputParameters {
    isResizable?: ITwoOptionsProperty;
    value: IStringProperty;
}

export interface ITextFieldOutputs extends IOutputs {
    value?: string;
}

export interface ITextFieldTranslations extends ITranslations {

}