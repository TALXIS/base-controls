import { IProperty } from "./property";

export interface IOutputs {
    [key: string]: any
}

export interface IBindings {
    [key: string]: IProperty | undefined;
}

export interface IContext {
    mode: ComponentFramework.Mode;
    userSettings: ComponentFramework.UserSettings;
    formatting: ComponentFramework.Formatting;
}

export interface IComponent<TBindings, TOutputs> {
    context: IContext;
    bindings: TBindings
    /**
    * Fires when the user looses focus on the component and the outputs differ from inputs.
    */
    onNotifyOutputChanged?: (outputs: TOutputs) => void;
}