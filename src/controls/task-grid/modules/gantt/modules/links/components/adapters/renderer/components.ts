import type { ITaskTooltipUiCalloutComponents, ITaskTooltipUiDateRangeComponents, ITaskTooltipUiFieldRowComponents, ITaskTooltipUiFieldRowsComponents, ITaskTooltipUiHeaderComponents } from "../../../../tooltip/components/ui";

/** The replaceable pieces of the default dependency tooltip, by the part they belong to. */
export interface ILinkTooltipRendererComponents {
    callout?: Partial<ITaskTooltipUiCalloutComponents>;
    header?: Partial<ITaskTooltipUiHeaderComponents>;
    fieldRows?: Partial<ITaskTooltipUiFieldRowsComponents>;
    predecessor?: Partial<ITaskTooltipUiFieldRowComponents>;
    successor?: Partial<ITaskTooltipUiFieldRowComponents>;
    dateRange?: Partial<ITaskTooltipUiDateRangeComponents>;
}
