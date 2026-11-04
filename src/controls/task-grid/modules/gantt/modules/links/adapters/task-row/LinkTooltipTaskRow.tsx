import { useLabels } from "@labels";
import { LINKS_LABELS } from "../../labels";
import { ITooltipUiFieldRowComponents, TooltipUiFieldRow } from "../../../../ui/tooltip";
import { useLinkTooltip } from "../link-tooltip-root";

export interface ILinkTooltipTaskRowProps {
    end: 'predecessor' | 'successor';
    iconName: string;
    components?: Partial<ITooltipUiFieldRowComponents>;
}

/** The name of the task at one end of the dependency. */
export const LinkTooltipTaskRow = (props: ILinkTooltipTaskRowProps) => {
    const { gantt, dependency } = useLinkTooltip();
    const labels = useLabels(LINKS_LABELS);
    const chart = gantt.services.get('chart');
    const taskId = props.end === 'predecessor' ? dependency.predecessorTaskId : dependency.successorTaskId;
    return <TooltipUiFieldRow label={labels.get(`links.${props.end}`)} iconName={props.iconName} components={props.components}>
        {chart.isTaskExists(taskId) ? chart.getTask(taskId).text : ''}
    </TooltipUiFieldRow>;
};
