import type { ITooltipUiCalloutComponents, ITooltipUiDateRangeComponents, ITooltipUiHeaderComponents, ITooltipUiProgressComponents } from "../../../../../../components/ui/tooltip";

/** The replaceable pieces of the default tooltip, by the part they belong to. */
export interface ITaskTooltipRendererComponents {
    callout?: Partial<ITooltipUiCalloutComponents>;
    header?: Partial<ITooltipUiHeaderComponents>;
    progress?: Partial<ITooltipUiProgressComponents>;
    dateRange?: Partial<ITooltipUiDateRangeComponents>;
}
