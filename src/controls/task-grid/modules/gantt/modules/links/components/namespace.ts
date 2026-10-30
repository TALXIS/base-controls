import { LinkTooltipRoot } from "./adapters/link-tooltip";
import { LinkTooltipRenderer } from "./adapters/renderer";
import { LinkTooltipCallout } from "./adapters/callout";
import { LinkTooltipHeader } from "./adapters/header";
import { LinkTooltipFieldRows } from "./adapters/field-rows";
import { LinkTooltipPredecessorRow } from "./adapters/predecessor-row";
import { LinkTooltipSuccessorRow } from "./adapters/successor-row";
import { LinkTooltipDateRangeRow } from "./adapters/date-range-row";

/** The parts a dependency tooltip is composed of, all inside `LinkTooltip`. */
export interface ILinkTooltipParts {
    /** The default tooltip, built from the parts below. */
    Renderer: typeof LinkTooltipRenderer;
    /** The callout next to the pointer. */
    Callout: typeof LinkTooltipCallout;
    /** The dependency's type. */
    Header: typeof LinkTooltipHeader;
    /** Holds the rows. */
    FieldRows: typeof LinkTooltipFieldRows;
    PredecessorRow: typeof LinkTooltipPredecessorRow;
    SuccessorRow: typeof LinkTooltipSuccessorRow;
    /** The dates the dependency links. */
    DateRangeRow: typeof LinkTooltipDateRangeRow;
}

/** Finds the hovered dependency line and draws its children for that dependency. */
export const LinkTooltip: typeof LinkTooltipRoot & ILinkTooltipParts = Object.assign(LinkTooltipRoot, {
    Renderer: LinkTooltipRenderer,
    Callout: LinkTooltipCallout,
    Header: LinkTooltipHeader,
    FieldRows: LinkTooltipFieldRows,
    PredecessorRow: LinkTooltipPredecessorRow,
    SuccessorRow: LinkTooltipSuccessorRow,
    DateRangeRow: LinkTooltipDateRangeRow,
});
