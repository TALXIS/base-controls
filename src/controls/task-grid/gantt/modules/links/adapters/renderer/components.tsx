import type { ITooltipUiCalloutComponents } from "../../../../ui/tooltip";
import type { IRecordCardDateRangeComponents, IRecordCardFieldRowComponents, IRecordCardFieldRowsComponents, IRecordCardHeaderPartsComponents } from "@ui";

/** The replaceable pieces of the default dependency tooltip, by the part they belong to. */
export interface ILinkTooltipRendererComponents {
    callout?: Partial<ITooltipUiCalloutComponents>;
    header?: IRecordCardHeaderPartsComponents;
    fieldRows?: Partial<IRecordCardFieldRowsComponents>;
    predecessor?: Partial<IRecordCardFieldRowComponents>;
    successor?: Partial<IRecordCardFieldRowComponents>;
    dateRange?: Partial<IRecordCardDateRangeComponents>;
}
