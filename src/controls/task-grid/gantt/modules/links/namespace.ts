import { Card } from "@ui";
import { LinkTooltipRenderer } from "./adapters/renderer";
import { LinkTooltipCallout } from "./adapters/callout";
import { LinkTooltipHeader } from "./adapters/header";
import { LinkTooltipFieldList } from "./adapters/field-list";
import { LinkTooltipPredecessor } from "./adapters/predecessor";
import { LinkTooltipSuccessor } from "./adapters/successor";
import { LinkTooltipDateRange } from "./adapters/date-range";

/** The parts a dependency tooltip is composed of; the module draws them for the hovered line. */
export interface ILinkTooltipParts {
    /** The default tooltip, built from the parts below. */
    Renderer: typeof LinkTooltipRenderer;
    /** The callout next to the pointer. */
    Callout: typeof LinkTooltipCallout;
    /** The dependency's type. */
    Header: typeof LinkTooltipHeader;
    /** Holds the fields below the header. */
    Body: typeof Card.Body;
    /** The band at the bottom, below a divider. */
    Footer: typeof Card.Footer;
    /** Holds the fields, one under another. */
    FieldList: typeof LinkTooltipFieldList;
    Predecessor: typeof LinkTooltipPredecessor;
    Successor: typeof LinkTooltipSuccessor;
    /** The dates the dependency links. */
    DateRange: typeof LinkTooltipDateRange;
}

export const LinkTooltip: ILinkTooltipParts = {
    Renderer: LinkTooltipRenderer,
    Callout: LinkTooltipCallout,
    Header: LinkTooltipHeader,
    Body: Card.Body,
    Footer: Card.Footer,
    FieldList: LinkTooltipFieldList,
    Predecessor: LinkTooltipPredecessor,
    Successor: LinkTooltipSuccessor,
    DateRange: LinkTooltipDateRange,
};
