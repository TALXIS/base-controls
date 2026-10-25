import type { ITaskTooltipUiCalloutComponents, ITaskTooltipUiDateRangeComponents, ITaskTooltipUiHeaderComponents, ITaskTooltipUiProgressComponents } from "../../ui";

/** The replaceable pieces of the default tooltip, by the part they belong to. */
export interface ITaskTooltipRendererComponents {
    callout?: Partial<ITaskTooltipUiCalloutComponents>;
    header?: Partial<ITaskTooltipUiHeaderComponents>;
    progress?: Partial<ITaskTooltipUiProgressComponents>;
    dateRange?: Partial<ITaskTooltipUiDateRangeComponents>;
}
