import { useLabels } from "@utils";
import { GANTT_LINKS_LABELS } from "../../../labels";
import { ITaskTooltipUiFieldRowComponents, TaskTooltipUiFieldRow } from "../../../../tooltip/components/ui";
import { useLinkTooltip } from "../link-tooltip";

export interface ILinkTooltipSuccessorRowProps {
    /** Defaults to `Next`. */
    iconName?: string;
    components?: Partial<ITaskTooltipUiFieldRowComponents>;
}

/** The name of the dependency's successor. */
export const LinkTooltipSuccessorRow = (props: ILinkTooltipSuccessorRowProps) => {
    const { gantt, dependency } = useLinkTooltip();
    const labels = useLabels(GANTT_LINKS_LABELS);
    const chart = gantt.services.get('chart');
    const taskId = dependency.successorTaskId;
    return <TaskTooltipUiFieldRow label={labels.get('ganttLinks.successor')} iconName={props.iconName ?? 'Next'} components={props.components}>
        {chart.isTaskExists(taskId) ? chart.getTask(taskId).text : ''}
    </TaskTooltipUiFieldRow>;
};
