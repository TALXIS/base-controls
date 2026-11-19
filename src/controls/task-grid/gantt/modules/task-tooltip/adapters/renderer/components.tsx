import type { ITaskTooltipHeaderComponents } from "../header";
import type { ITooltipUiCalloutComponents } from "../../../../ui/tooltip";
import type { ICardBodyComponents, ICardFooterComponents, IFieldListComponents, IFieldListDateRangeComponents, IFieldListProgressComponents } from "@ui";

/** The replaceable pieces of the default tooltip, by the part they belong to. */
export interface ITaskTooltipRendererComponents {
    callout?: Partial<ITooltipUiCalloutComponents>;
    header?: ITaskTooltipHeaderComponents;
    body?: Partial<ICardBodyComponents>;
    footer?: Partial<ICardFooterComponents>;
    fieldRows?: Partial<IFieldListComponents>;
    progress?: Partial<IFieldListProgressComponents>;
    dateRange?: Partial<IFieldListDateRangeComponents>;
}
