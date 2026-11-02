import { ITaskTooltipUiFieldRowComponents, TaskTooltipUiFieldRow } from "../../ui";
import { useTaskTooltip } from "../task-tooltip";

export interface ITaskTooltipEndDateRowProps {
    /** Defaults to `CalendarReply`. */
    iconName?: string;
    components?: Partial<ITaskTooltipUiFieldRowComponents>;
}

/** The task's end as the timeline draws it, not as the record holds it. */
export const TaskTooltipEndDateRow = (props: ITaskTooltipEndDateRowProps) => {
    const { gantt, span } = useTaskTooltip();
    if (!span) {
        return null;
    }
    const schedule = gantt.services.get('schedule');
    return <TaskTooltipUiFieldRow label={schedule.getLabels().end} iconName={props.iconName ?? 'CalendarReply'} components={props.components}>{schedule.format(span).end}</TaskTooltipUiFieldRow>;
};
