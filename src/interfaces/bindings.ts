import { IProperty, ITwoOptionsProperty } from "./property";

export interface IParameters {
    [key: string]: IProperty | undefined;
}

export interface IInputStaticParameters extends IParameters {
    /** default `true`    */
    EnableBorder?: ITwoOptionsProperty;
    /**
    * Decides whether the input should get focus on first render.
     */
    AutoFocus?: ITwoOptionsProperty;
    EnableCopyButton?: ITwoOptionsProperty;
    EnableDeleteButton?: ITwoOptionsProperty;
}