import type { ITemplatesUiRecordListComponents, ITemplatesUiRecordSelectorFrameComponents } from "../../ui/record-selector";

/** The replaceable pieces of {@link RecordSelector}, by the part they belong to. */
export interface IRecordSelectorComponents {
    frame?: Partial<ITemplatesUiRecordSelectorFrameComponents>;
    list?: Partial<ITemplatesUiRecordListComponents>;
}
