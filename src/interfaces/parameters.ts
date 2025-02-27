import { IProperty, ITwoOptionsProperty } from "./property";

export interface IParameters {
    [key: string]: IProperty | undefined;
}

export interface IInputParameters extends IBaseParameters {
    value: IProperty;
    /**
    * Tells the control to trigger `notifyOutputChanged` on it's unmount changes occured in bound parameter value.
    * Should only be use in edge cases in input based controls where the notifyOutputChanged cannot be called naturally via the blur event.
     */
    NotifyOutputChangedOnUnmount?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableCopyButton?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableDeleteButton?: Omit<ITwoOptionsProperty, 'attributes'>;
    /**
     * Shows the error message within the control. By default, the error is represented only by red outline.
     */
    ShowErrorMessage?: Omit<ITwoOptionsProperty, 'attributes'>;

}

export interface IBaseParameters extends IParameters {
    /**
    * Decides whether the input should get focus on first render.
    */
    AutoFocus?:  Omit<ITwoOptionsProperty, 'attributes'>;
    ForceDisable?: Omit<ITwoOptionsProperty, 'attributes'>;
}