import { useLabels } from "@utils";
import { GANTT_LINKS_LABELS } from "../../../labels";
import { ITaskTooltipUiFieldRowComponents, TaskTooltipUiFieldRow } from "../../../../tooltip/components/ui";
import { useLinkTooltip } from "../link-tooltip";

export interface ILinkTooltipPredecessorRowProps {
    /** Defaults to `Previous`. */
    iconName?: string;
    components?: Partial<ITaskTooltipUiFieldRowComponents>;
}

/** The name of the dependency's predecessor. */
export const LinkTooltipPredecessorRow = (props: ILinkTooltipPredecessorRowProps) => {
    const { gantt, dependency } = useLinkTooltip();
    const labels = useLabels(GANTT_LINKS_LABELS);
    const chart = gantt.services.get('chart');
    const taskId = dependency.predecessorTaskId;
    return <TaskTooltipUiFieldRow label={labels.get('ganttLinks.predecessor')} iconName={props.iconName ?? 'Previous'} components={props.components}>
        {chart.isTaskExists(taskId) ? chart.getTask(taskId).text : ''}
    </TaskTooltipUiFieldRow>;
};
