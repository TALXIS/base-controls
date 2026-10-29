import { useLabels } from "@utils";
import { GANTT_TOOLTIP_LABELS } from "../../../labels";
import { ITaskTooltipUiFieldRowComponents, TaskTooltipUiFieldRow } from "../../ui";
import { useTaskTooltip } from "../task-tooltip";

export interface ITaskTooltipDurationRowProps {
    /** Defaults to `Clock`. */
    iconName?: string;
    components?: Partial<ITaskTooltipUiFieldRowComponents>;
}

/** How long the task takes, estimated from its bar while it is dragged. */
export const TaskTooltipDurationRow = (props: ITaskTooltipDurationRowProps) => {
    const { gantt, duration } = useTaskTooltip();
    const labels = useLabels(GANTT_TOOLTIP_LABELS);
    if (duration === undefined) {
        return null;
    }
    const text = gantt.services.get('schedule').formatDuration(duration);
    return <TaskTooltipUiFieldRow label={labels.get('ganttTooltip.duration')} iconName={props.iconName ?? 'Clock'} components={props.components}>{text}</TaskTooltipUiFieldRow>;
};
