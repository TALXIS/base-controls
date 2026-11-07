import type { IRecordCardComponents, IRecordCardHeaderPartsComponents } from "@ui";

/** The replaceable pieces of the default popup, by the part they belong to. */
export interface IMapPopupRendererComponents {
    card?: Partial<IRecordCardComponents>;
    header?: IRecordCardHeaderPartsComponents;
}
