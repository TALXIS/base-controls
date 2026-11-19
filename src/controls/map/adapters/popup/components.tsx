import type { IMapPopupHeaderComponents } from "./MapPopupHeader";

/** The replaceable pieces of the default popup, by the part they belong to. */
export interface IMapPopupRendererComponents {
    header?: IMapPopupHeaderComponents;
}

/** A pin's popup content: the whole of it, or the default's parts. */
export interface IMapPopupComponents extends IMapPopupRendererComponents {
    /** The whole content, composed from `MapPopup`'s parts; `header` goes unused with it. */
    onRender?: () => JSX.Element | null;
}
