import { useGanttModule } from "../../../../../context";
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
    const labels = useGanttModule('tooltip').getLabels();
    if (duration === undefined) {
        return null;
    }
    const text = gantt.services.get('schedule').formatDuration(duration);
    return <TaskTooltipUiFieldRow label={labels.getLocalizedString('duration')} iconName={props.iconName ?? 'Clock'} components={props.components}>{text}</TaskTooltipUiFieldRow>;
};
