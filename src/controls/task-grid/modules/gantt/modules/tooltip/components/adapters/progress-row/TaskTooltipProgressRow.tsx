import { ITaskTooltipUiProgressComponents, TaskTooltipUiProgress } from "../../ui";
import { useTaskTooltip } from "../task-tooltip";

export interface ITaskTooltipProgressRowProps {
    components?: Partial<ITaskTooltipUiProgressComponents>;
}

/** The task's `percentComplete` as a bar; nothing when it is not mapped or empty. */
export const TaskTooltipProgressRow = (props: ITaskTooltipProgressRowProps) => {
    const { gantt, record } = useTaskTooltip();
    const columnName = gantt.getTaskRuntime().getFieldMapping().percentComplete;
    const value = columnName ? record.getValue(columnName) : null;
    if (!columnName || value == null || value === '') {
        return null;
    }
    const percent = Number(value);
    return <TaskTooltipUiProgress percent={percent} text={`${Math.round(percent)}%`} components={props.components} />;
};
