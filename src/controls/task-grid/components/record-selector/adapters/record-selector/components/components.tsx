import type { IRecordListComponents, IRecordSelectorFrameComponents } from "../../../ui";

/** The replaceable pieces of {@link RecordSelector}, by the part they belong to. */
export interface IRecordSelectorComponents {
    frame?: Partial<IRecordSelectorFrameComponents>;
    list?: Partial<IRecordListComponents>;
}
