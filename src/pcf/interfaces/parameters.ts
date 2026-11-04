import { IProperty, ITwoOptionsProperty } from "./property";

export interface IParameters {
    [key: string]: IProperty | undefined | any;
}

/** The cell of a host, such as a grid, that a control is drawn in. */
export interface IControlHostCell {
    /** Tells the host the control has nothing more to take. */
    finishEditing(): void;
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
    /**
     * Lets the control be whatever height its container gives it, rather than the height it was allocated.
     *
     * For a host that sizes the box itself - a grid cell is one - which the control then fills, and shrinks
     * with. Unset, the control is the height it was allocated, which is what a form gives it.
     */
    FillAvailableSpace?: Omit<ITwoOptionsProperty, 'attributes'>;
    /**
     * The host cell this control is drawn in, where a host such as a grid is drawing it.
     *
     * `undefined` outside such a host, and while a cell is drawn for the first time: the host is told about
     * a cell once it is on screen.
     */
    Cell?: { raw: IControlHostCell | undefined };
}