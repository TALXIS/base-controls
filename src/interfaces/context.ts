import { IProperty } from "./property";

export interface IInputs {
    [key: string]: IProperty;
}

export interface IOutputs {
    [key: string]: any
}

export interface IContext<TInputs, TOutputs> {
    inputs: TInputs;
    mode: ComponentFramework.Mode;
    userSettings: ComponentFramework.UserSettings;
    formatting: ComponentFramework.Formatting;
    /**
     * Fires when the user looses focus on the component and the outputs differ from inputs.
    */
    onNotifyOutputChanged?: (outputs: TOutputs) => void;
    /**
     * Called when the component gets onmounted from DOM.
    */
    onDestroy?: (outputs: TOutputs) => void;

}