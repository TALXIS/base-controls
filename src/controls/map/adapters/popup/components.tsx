import type { IRecordCardComponents, IRecordCardHeaderPartsComponents } from "@ui";

/** The replaceable pieces of the default popup, by the part they belong to. */
export interface IMapPopupRendererComponents {
    card?: Partial<IRecordCardComponents>;
    header?: IRecordCardHeaderPartsComponents;
}

/** A pin's popup content: the whole of it, or the default's parts. */
export interface IMapPopupComponents extends IMapPopupRendererComponents {
    /** The whole content, composed from `MapPopup`'s parts; `card` and `header` go unused with it. */
    onRender?: () => JSX.Element | null;
}
