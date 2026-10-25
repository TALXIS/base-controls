import { ITaskTooltipUiFieldRowComponents, TaskTooltipUiFieldRow } from "../../ui";
import { useTaskTooltip } from "../task-tooltip";
import { useBarDate } from "./useBarDate";

export interface ITaskTooltipStartDateRowProps {
    /** Defaults to `Calendar`. */
    iconName?: string;
    components?: Partial<ITaskTooltipUiFieldRowComponents>;
}

/** The task's start as the timeline draws it, not as the record holds it. */
export const TaskTooltipStartDateRow = (props: ITaskTooltipStartDateRowProps) => {
    const { gantt, task } = useTaskTooltip();
    const date = useBarDate(task.start_date, gantt.services.get('dates').getStartColumnName());
    return date ? <TaskTooltipUiFieldRow label={date.label} iconName={props.iconName ?? 'Calendar'} components={props.components}>{date.value}</TaskTooltipUiFieldRow> : null;
};
