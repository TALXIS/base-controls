import type { ITooltipUiCalloutComponents, ITooltipUiDateRangeComponents, ITooltipUiFieldRowComponents, ITooltipUiFieldRowsComponents, ITooltipUiHeaderComponents } from "../../../../../../components/ui/tooltip";

/** The replaceable pieces of the default dependency tooltip, by the part they belong to. */
export interface ILinkTooltipRendererComponents {
    callout?: Partial<ITooltipUiCalloutComponents>;
    header?: Partial<ITooltipUiHeaderComponents>;
    fieldRows?: Partial<ITooltipUiFieldRowsComponents>;
    predecessor?: Partial<ITooltipUiFieldRowComponents>;
    successor?: Partial<ITooltipUiFieldRowComponents>;
    dateRange?: Partial<ITooltipUiDateRangeComponents>;
}
