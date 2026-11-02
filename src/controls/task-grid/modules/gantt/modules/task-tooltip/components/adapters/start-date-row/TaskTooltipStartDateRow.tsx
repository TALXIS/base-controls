import { ITaskTooltipUiFieldRowComponents, TaskTooltipUiFieldRow } from "../../ui";
import { useTaskTooltip } from "../task-tooltip";

export interface ITaskTooltipStartDateRowProps {
    /** Defaults to `Calendar`. */
    iconName?: string;
    components?: Partial<ITaskTooltipUiFieldRowComponents>;
}

/** The task's start as the timeline draws it, not as the record holds it. */
export const TaskTooltipStartDateRow = (props: ITaskTooltipStartDateRowProps) => {
    const { gantt, span } = useTaskTooltip();
    if (!span) {
        return null;
    }
    const schedule = gantt.services.get('schedule');
    return <TaskTooltipUiFieldRow label={schedule.getLabels().start} iconName={props.iconName ?? 'Calendar'} components={props.components}>{schedule.format(span).start}</TaskTooltipUiFieldRow>;
};
