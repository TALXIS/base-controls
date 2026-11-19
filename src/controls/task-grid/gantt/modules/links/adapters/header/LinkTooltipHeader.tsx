import { useLabels } from "@labels";
import { LINKS_LABELS } from "../../labels";
import { Card, ICardHeaderPartsComponents } from "@ui";
import { useLinkTooltip } from "../link-tooltip-surface/context";

export interface ILinkTooltipHeaderProps {
    components?: ICardHeaderPartsComponents;
}

/** The dependency's type. */
export const LinkTooltipHeader = (props: ILinkTooltipHeaderProps) => {
    const { dependency } = useLinkTooltip();
    const labels = useLabels(LINKS_LABELS);
    const components = props.components ?? {};
    return <Card.Header components={components.header}>
        <Card.Header.Start components={components.headerStart}>
            <Card.Title components={components.title}>{labels.get(`links.${dependency.type}`)}</Card.Title>
        </Card.Header.Start>
    </Card.Header>;
};
