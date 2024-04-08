import { IProperty, ITwoOptionsProperty } from "./property";

export interface IParameters {
    [key: string]: IProperty | undefined;
}

export interface IInputParameters extends IBaseParameters {
    value: IProperty;
    /**
    * Tells the component to trigger `notifyOutputChanged` on it's unmount changes occured in bound parameter value.
    * Should only be use in edge cases in input based components where the notifyOutputChanged cannot be called naturally via the blur event.
     */
    NotifyOutputChangedOnUnmount?: ITwoOptionsProperty;
    EnableCopyButton?: ITwoOptionsProperty;
    EnableDeleteButton?: ITwoOptionsProperty;
}

export interface IBaseParameters extends IParameters {
    /** default `true`    */
    EnableBorder?: ITwoOptionsProperty;
    /**
    * Decides whether the input should get focus on first render.
    */
    AutoFocus?: ITwoOptionsProperty;
    ForceDisable?: ComponentFramework.PropertyTypes.StringProperty;
}