export interface IOutputs {
    [key: string]: any
}

export interface IComponent<TParameters, TOutputs, TTranslations> {
    context: ComponentFramework.Context<TParameters>;
    parameters: TParameters;
    translations?: TTranslations
    /**
    * Fires when the component changes the parameter value. It is usually fired directly after the change occurs in the value.
    * Exceptions are input based component where it fires on the blur event.
    */
    onNotifyOutputChanged?: (outputs: TOutputs) => void;
}

export interface ITranslations {
    [key: string]: {
        [LCID: number]: string | string[]
    } | undefined
}
