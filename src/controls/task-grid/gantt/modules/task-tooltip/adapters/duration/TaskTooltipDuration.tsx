import { useLabels } from "@labels";
import { TASK_TOOLTIP_LABELS } from "../../labels";
import { IFieldValueComponents, Field } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";

export interface ITaskTooltipDurationProps {
    /** Defaults to `Clock`. */
    iconName?: string;
    components?: Partial<IFieldValueComponents>;
}

/** How long the task takes, estimated from its bar while it is dragged. */
export const TaskTooltipDuration = (props: ITaskTooltipDurationProps) => {
    const { gantt, duration } = useTaskTooltip();
    const labels = useLabels(TASK_TOOLTIP_LABELS);
    if (duration === undefined) {
        return null;
    }
    const text = gantt.services.get('schedule').formatDuration(duration);
    return <Field.Value label={labels.get('taskTooltip.duration')} iconName={props.iconName ?? 'Clock'} components={props.components}>{text}</Field.Value>;
};
