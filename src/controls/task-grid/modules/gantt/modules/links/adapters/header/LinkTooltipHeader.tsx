import { useLabels } from "@labels";
import { LINKS_LABELS } from "../../labels";
import { ITooltipUiHeaderComponents, TooltipUiHeader } from "../../../../ui/tooltip";
import { useLinkTooltip } from "../link-tooltip-root";

export interface ILinkTooltipHeaderProps {
    components?: Partial<ITooltipUiHeaderComponents>;
}

/** The dependency's type. */
export const LinkTooltipHeader = (props: ILinkTooltipHeaderProps) => {
    const { dependency } = useLinkTooltip();
    const labels = useLabels(LINKS_LABELS);
    return <TooltipUiHeader title={labels.get(`links.${dependency.type}`)} components={props.components} />;
};
