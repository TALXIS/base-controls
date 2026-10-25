import { useGanttModule } from "../../../../../context";
import { ITaskTooltipUiFieldRowComponents, TaskTooltipUiFieldRow } from "../../ui";
import { useTaskTooltip } from "../task-tooltip";

export interface ITaskTooltipDurationRowProps {
    /** Defaults to `Clock`. */
    iconName?: string;
    components?: Partial<ITaskTooltipUiFieldRowComponents>;
}

/** How long the task runs as the timeline draws it, not as the record holds it. */
export const TaskTooltipDurationRow = (props: ITaskTooltipDurationRowProps) => {
    const { gantt, task } = useTaskTooltip();
    const labels = useGanttModule('tooltip').getLabels();
    if (!task.start_date || !task.end_date) {
        return null;
    }
    const text = gantt.getTaskRuntime().getProvider().getFormatting().formatDuration((+task.end_date - +task.start_date) / 60_000);
    return <TaskTooltipUiFieldRow label={labels.getLocalizedString('duration')} iconName={props.iconName ?? 'Clock'} components={props.components}>{text}</TaskTooltipUiFieldRow>;
};
