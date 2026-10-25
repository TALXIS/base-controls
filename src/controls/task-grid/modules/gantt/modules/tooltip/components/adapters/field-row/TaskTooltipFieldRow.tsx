import { ITaskTooltipUiFieldRowComponents, TaskTooltipUiFieldRow } from "../../ui";
import { useTaskTooltip } from "../task-tooltip";

export interface ITaskTooltipFieldRowProps {
    columnName: string;
    iconName?: string;
    components?: Partial<ITaskTooltipUiFieldRowComponents>;
}

/** One column of the task under its display name; nothing while it is empty. */
export const TaskTooltipFieldRow = (props: ITaskTooltipFieldRowProps) => {
    const { gantt, record } = useTaskTooltip();
    const value = record.getFormattedValue(props.columnName);
    if (!value) {
        return null;
    }
    const label = gantt.getTaskRuntime().getProvider().getColumnsMap()[props.columnName]?.displayName ?? props.columnName;
    return <TaskTooltipUiFieldRow label={label} iconName={props.iconName} components={props.components}>{value}</TaskTooltipUiFieldRow>;
};
