import { LinkTooltipRoot } from "../link-tooltip";
import { LinkTooltipCallout } from "../callout";
import { LinkTooltipHeader } from "../header";
import { LinkTooltipFieldRows } from "../field-rows";
import { LinkTooltipPredecessorRow } from "../predecessor-row";
import { LinkTooltipSuccessorRow } from "../successor-row";
import { LinkTooltipDateRangeRow } from "../date-range-row";
import { ILinkTooltipRendererComponents } from "./components";

export interface ILinkTooltipRendererProps {
    components?: ILinkTooltipRendererComponents;
}

/** The default dependency tooltip: its type, its two tasks and the dates it links. */
export const LinkTooltipRenderer = (props: ILinkTooltipRendererProps) => {
    const components = props.components ?? {};
    return <LinkTooltipRoot>
        <LinkTooltipCallout components={components.callout}>
            <LinkTooltipHeader components={components.header} />
            <LinkTooltipFieldRows components={components.fieldRows}>
                <LinkTooltipPredecessorRow components={components.predecessor} />
                <LinkTooltipSuccessorRow components={components.successor} />
            </LinkTooltipFieldRows>
            <LinkTooltipDateRangeRow components={components.dateRange} />
        </LinkTooltipCallout>
    </LinkTooltipRoot>;
};
