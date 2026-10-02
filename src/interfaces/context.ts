import type { IFormatting } from "@talxis/client-libraries";
import { IParameters } from ".";

export interface IOutputs {
    [key: string]: any
}

/** The PCF context as this library provides it, with its own formatting. */
export interface IPcfContext<TInputs = any, TEvents = any> extends ComponentFramework.Context<TInputs, TEvents> {
    formatting: IFormatting;
}

export interface IControl<TParameters extends IParameters, TOutputs, TTranslations, TComponentProps> {
    context: IPcfContext;
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
    onOverrideComponentProps?: (props: TComponentProps) => TComponentProps; 
}

export type ITranslations<T> = {
    [Property in keyof T]: T[Property] extends string[] ? string[] : string
}