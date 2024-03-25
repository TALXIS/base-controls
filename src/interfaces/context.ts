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
    parameters: TParameters
    /**
    * Fires when the user looses focus on the component and the outputs differ from inputs.
    */
    onNotifyOutputChanged?: (outputs: TOutputs) => void;
}