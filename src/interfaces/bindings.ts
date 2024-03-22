import { IProperty, ITwoOptionsProperty } from "./property";

export interface IBindings {
    [key: string]: IProperty | undefined;
}

export interface IInputStaticBindings extends IBindings {
    /** default `true`    */
    EnableBorder?: ITwoOptionsProperty;
    /**
    * Decides whether the input should get focus on first render.
     */
    AutoFocus?: ITwoOptionsProperty;
    EnableCopyButton?: ITwoOptionsProperty;
    EnableDeleteButton?: ITwoOptionsProperty;
}