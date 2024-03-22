import { IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { IInputStaticBindings } from "../../interfaces/bindings";
import { IComponent, IOutputs } from "../../interfaces/context";

export interface ITextField extends IComponent<ITextFieldBindings, ITextFieldOutputs> {
}

interface ITextFieldBindings extends IInputStaticBindings {
    IsMultiLine?: ITwoOptionsProperty;
    value: IStringProperty;
}

interface ITextFieldOutputs extends IOutputs {
    value?: string;
}