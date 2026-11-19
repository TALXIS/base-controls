import type { ITooltipUiCalloutComponents } from "../../../../ui/tooltip";
import type { ICardBodyComponents, ICardFooterComponents, IFieldListDateRangeComponents, IFieldListRowComponents, IFieldListComponents, ICardHeaderPartsComponents } from "@ui";

/** The replaceable pieces of the default dependency tooltip, by the part they belong to. */
export interface ILinkTooltipRendererComponents {
    callout?: Partial<ITooltipUiCalloutComponents>;
    header?: ICardHeaderPartsComponents;
    body?: Partial<ICardBodyComponents>;
    footer?: Partial<ICardFooterComponents>;
    fieldRows?: Partial<IFieldListComponents>;
    predecessor?: Partial<IFieldListRowComponents>;
    successor?: Partial<IFieldListRowComponents>;
    dateRange?: Partial<IFieldListDateRangeComponents>;
}
