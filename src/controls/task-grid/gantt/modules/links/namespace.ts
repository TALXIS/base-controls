import { Card } from "@ui";
import { LinkTooltipRenderer } from "./adapters/renderer";
import { LinkTooltipCallout } from "./adapters/callout";
import { LinkTooltipHeader } from "./adapters/header";
import { LinkTooltipFieldRows } from "./adapters/field-rows";
import { LinkTooltipPredecessorRow } from "./adapters/predecessor-row";
import { LinkTooltipSuccessorRow } from "./adapters/successor-row";
import { LinkTooltipDateRangeRow } from "./adapters/date-range-row";

/** The parts a dependency tooltip is composed of; the module draws them for the hovered line. */
export interface ILinkTooltipParts {
    /** The default tooltip, built from the parts below. */
    Renderer: typeof LinkTooltipRenderer;
    /** The callout next to the pointer. */
    Callout: typeof LinkTooltipCallout;
    /** The dependency's type. */
    Header: typeof LinkTooltipHeader;
    /** Holds the rows below the header. */
    Body: typeof Card.Body;
    /** The row at the bottom, below a divider. */
    Footer: typeof Card.Footer;
    /** Holds the rows. */
    FieldRows: typeof LinkTooltipFieldRows;
    PredecessorRow: typeof LinkTooltipPredecessorRow;
    SuccessorRow: typeof LinkTooltipSuccessorRow;
    /** The dates the dependency links. */
    DateRangeRow: typeof LinkTooltipDateRangeRow;
}

export const LinkTooltip: ILinkTooltipParts = {
    Renderer: LinkTooltipRenderer,
    Callout: LinkTooltipCallout,
    Header: LinkTooltipHeader,
    Body: Card.Body,
    Footer: Card.Footer,
    FieldRows: LinkTooltipFieldRows,
    PredecessorRow: LinkTooltipPredecessorRow,
    SuccessorRow: LinkTooltipSuccessorRow,
    DateRangeRow: LinkTooltipDateRangeRow,
};
