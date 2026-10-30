import { useLabels } from "@utils";
import { GANTT_LINKS_LABELS } from "../../../labels";
import { ITaskTooltipUiHeaderComponents, TaskTooltipUiHeader } from "../../../../tooltip/components/ui";
import { useLinkTooltip } from "../link-tooltip";

export interface ILinkTooltipHeaderProps {
    components?: Partial<ITaskTooltipUiHeaderComponents>;
}

/** The dependency's type. */
export const LinkTooltipHeader = (props: ILinkTooltipHeaderProps) => {
    const { dependency } = useLinkTooltip();
    const labels = useLabels(GANTT_LINKS_LABELS);
    return <TaskTooltipUiHeader title={labels.get(`ganttLinks.${dependency.type}`)} components={props.components} />;
};
