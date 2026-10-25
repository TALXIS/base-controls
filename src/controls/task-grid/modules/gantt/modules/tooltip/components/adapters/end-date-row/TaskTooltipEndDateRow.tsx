import { ITaskTooltipUiFieldRowComponents, TaskTooltipUiFieldRow } from "../../ui";
import { useTaskTooltip } from "../task-tooltip";
import { useBarDate } from "../start-date-row";

export interface ITaskTooltipEndDateRowProps {
    /** Defaults to `CalendarReply`. */
    iconName?: string;
    components?: Partial<ITaskTooltipUiFieldRowComponents>;
}

/** The task's end as the timeline draws it, not as the record holds it. */
export const TaskTooltipEndDateRow = (props: ITaskTooltipEndDateRowProps) => {
    const { gantt, task } = useTaskTooltip();
    const date = useBarDate(task.end_date, gantt.services.get('dates').getEndColumnName());
    return date ? <TaskTooltipUiFieldRow label={date.label} iconName={props.iconName ?? 'CalendarReply'} components={props.components}>{date.value}</TaskTooltipUiFieldRow> : null;
};
