import type { ITooltipUiCalloutComponents } from "../../../../ui/tooltip";
import type { ICardBodyComponents, ICardFooterComponents, IRecordCardDateRangeComponents, IRecordCardHeaderPartsComponents, IRecordCardProgressComponents } from "@ui";

/** The replaceable pieces of the default tooltip, by the part they belong to. */
export interface ITaskTooltipRendererComponents {
    callout?: Partial<ITooltipUiCalloutComponents>;
    header?: IRecordCardHeaderPartsComponents;
    body?: Partial<ICardBodyComponents>;
    footer?: Partial<ICardFooterComponents>;
    progress?: Partial<IRecordCardProgressComponents>;
    dateRange?: Partial<IRecordCardDateRangeComponents>;
}
