import { IProperty, ITwoOptionsProperty } from "./property";

export interface IParameters {
    [key: string]: IProperty | undefined;
}

export interface IInputParameters extends IParameters {
    value: IProperty;
    /** default `true`    */
    EnableBorder?: ITwoOptionsProperty;
    /**
    * Tells the component to trigger `notifyOutputChanged` on it's unmount changes occured in bound parameter value.
    * Should only be use in edge cases in input based components where the notifyOutputChanged cannot be called naturally via the blur event.
     */
    NotifyOutputChangedOnUnmount?: ITwoOptionsProperty;
    /**
    * Decides whether the input should get focus on first render.
     */
    AutoFocus?: ITwoOptionsProperty;
    EnableCopyButton?: ITwoOptionsProperty;
    EnableDeleteButton?: ITwoOptionsProperty;
}