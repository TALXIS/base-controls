export interface IOutputs {
    [key: string]: any
}

export interface IControl<TParameters, TOutputs, TTranslations, TComponentProps> {
    context: ComponentFramework.Context<any>;
    parameters: TParameters;
    translations?: TTranslations;
    state?: ComponentFramework.Dictionary;
    /**
    * Fires when the component changes the parameter value. It is usually fired directly after the change occurs in the value.
    * Exceptions are input based component where it fires on the blur event.
    */
    onNotifyOutputChanged?: (outputs: TOutputs) => void;
    /**
    * Allows you to override the props of the internal component that the control uses for UI rendering. Might not work on every control. ONLY USE WHEN ABSOLUTELY NECESSARY AND CONSULT YOUR INTENTIONS WITH BRY!
    */
    onOverrideComponentProps?: (props: TComponentProps) => Partial<TComponentProps>; 
}

export type ITranslations<T> = {
    [Property in keyof T]: T[Property] extends string[] ? string[] : string
}