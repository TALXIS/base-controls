import { ITextFieldProps } from "@legacy";
import { IStringProperty, ITwoOptionsProperty } from "@interfaces";
import { IControl, IOutputs } from "@interfaces/context";
import { IInputParameters } from "@interfaces/parameters";

export interface ITextField extends IControl<ITextFieldParameters, ITextFieldOutputs, any, ITextFieldProps> {
}

export interface ITextFieldParameters extends IInputParameters {
    isResizable?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableTypeSuffix?: Omit<ITwoOptionsProperty, 'attributes'>;
    /** Text shown while the field is empty. Left unset, the control's default `---` is used. */
    Placeholder?: IStringProperty;
    value: IStringProperty;
}

export interface ITextFieldOutputs extends IOutputs {
    value?: string;
}