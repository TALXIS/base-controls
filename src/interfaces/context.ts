export interface IOutputs {
    [key: string]: any
}

export interface IContext {
    mode: ComponentFramework.Mode;
    userSettings: ComponentFramework.UserSettings;
    formatting: ComponentFramework.Formatting;
}

export interface IComponent<TParameters, TOutputs> {
    context: IContext;
    parameters: TParameters;
    /**
    * Fires when the component changes the parameter value. It is usually fired directly after the change occurs in the value.
    * Exceptions are input based component where it fires on the blur event.
    */
    onNotifyOutputChanged?: (outputs: TOutputs) => void;
}