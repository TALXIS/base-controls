import type { ICardBodyComponents, IFieldListComponents, IFieldValueComponents } from "@ui";
import type { IMapPopupHeaderComponents } from "./MapPopupHeader";

/** The replaceable pieces of the default popup, by the part they belong to. */
export interface IMapPopupRendererComponents {
    header?: IMapPopupHeaderComponents;
    body?: Partial<ICardBodyComponents>;
    fieldList?: Partial<IFieldListComponents>;
    /** Every column's field. */
    field?: Partial<IFieldValueComponents>;
}

/** A pin's popup content: the whole of it, or the default's parts. */
export interface IMapPopupComponents extends IMapPopupRendererComponents {
    /** The whole content, composed from `MapPopup`'s parts; the other keys go unused with it. */
    onRender?: () => JSX.Element | null;
}
