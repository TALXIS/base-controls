import type { ITooltipUiCalloutComponents } from "../../../../ui/tooltip";
import type { ICardBodyComponents, ICardFooterComponents, IFieldDateRangeComponents, IFieldValueComponents, IFieldListComponents, ICardHeaderPartsComponents } from "@ui";

/** The replaceable pieces of the default dependency tooltip, by the part they belong to. */
export interface ILinkTooltipRendererComponents {
    callout?: Partial<ITooltipUiCalloutComponents>;
    header?: ICardHeaderPartsComponents;
    body?: Partial<ICardBodyComponents>;
    footer?: Partial<ICardFooterComponents>;
    fieldList?: Partial<IFieldListComponents>;
    predecessor?: Partial<IFieldValueComponents>;
    successor?: Partial<IFieldValueComponents>;
    dateRange?: Partial<IFieldDateRangeComponents>;
}
