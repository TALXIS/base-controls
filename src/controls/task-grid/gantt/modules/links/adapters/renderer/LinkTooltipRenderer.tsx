import { Card } from "@ui";
import { LinkTooltipCallout } from "../callout";
import { LinkTooltipHeader } from "../header";
import { LinkTooltipFieldList } from "../field-list";
import { LinkTooltipPredecessor } from "../predecessor";
import { LinkTooltipSuccessor } from "../successor";
import { LinkTooltipDateRange } from "../date-range";
import { ILinkTooltipRendererComponents } from "./components";

export interface ILinkTooltipRendererProps {
    components?: ILinkTooltipRendererComponents;
}

/** The default dependency tooltip: its type, its two tasks and the dates it links. */
export const LinkTooltipRenderer = (props: ILinkTooltipRendererProps) => {
    const components = props.components ?? {};
    return <LinkTooltipCallout components={components.callout}>
        <LinkTooltipHeader components={components.header} />
        <Card.Body components={components.body}>
            <LinkTooltipFieldList components={components.fieldList}>
                <LinkTooltipPredecessor components={components.predecessor} />
                <LinkTooltipSuccessor components={components.successor} />
            </LinkTooltipFieldList>
        </Card.Body>
        <Card.Footer components={components.footer}>
            <LinkTooltipFieldList components={components.fieldList}>
                <LinkTooltipDateRange components={components.dateRange} />
            </LinkTooltipFieldList>
        </Card.Footer>
    </LinkTooltipCallout>;
};
