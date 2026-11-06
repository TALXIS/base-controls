import type { ITooltipUiCalloutComponents } from "../../../../ui/tooltip";
import type { IRecordCardDateRangeComponents, IRecordCardHeaderPartsComponents, IRecordCardProgressComponents } from "@ui";

/** The replaceable pieces of the default tooltip, by the part they belong to. */
export interface ITaskTooltipRendererComponents {
    callout?: Partial<ITooltipUiCalloutComponents>;
    header?: IRecordCardHeaderPartsComponents;
    progress?: Partial<IRecordCardProgressComponents>;
    dateRange?: Partial<IRecordCardDateRangeComponents>;
}
