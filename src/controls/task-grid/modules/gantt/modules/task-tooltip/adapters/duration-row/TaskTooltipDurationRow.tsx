import { useLabels } from "@core";
import { TASK_TOOLTIP_LABELS } from "../../labels";
import { ITooltipUiFieldRowComponents, TooltipUiFieldRow } from "../../../../ui/tooltip";
import { useTaskTooltip } from "../task-tooltip-root";

export interface ITaskTooltipDurationRowProps {
    /** Defaults to `Clock`. */
    iconName?: string;
    components?: Partial<ITooltipUiFieldRowComponents>;
}

/** How long the task takes, estimated from its bar while it is dragged. */
export const TaskTooltipDurationRow = (props: ITaskTooltipDurationRowProps) => {
    const { gantt, duration } = useTaskTooltip();
    const labels = useLabels(TASK_TOOLTIP_LABELS);
    if (duration === undefined) {
        return null;
    }
    const text = gantt.services.get('schedule').formatDuration(duration);
    return <TooltipUiFieldRow label={labels.get('taskTooltip.duration')} iconName={props.iconName ?? 'Clock'} components={props.components}>{text}</TooltipUiFieldRow>;
};
