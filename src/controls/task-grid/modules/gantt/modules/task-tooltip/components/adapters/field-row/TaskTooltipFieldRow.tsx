import { ITooltipUiFieldRowComponents, TooltipUiFieldRow } from "../../../../../components/ui/tooltip";
import { useTaskTooltip } from "../task-tooltip-root";

export interface ITaskTooltipFieldRowProps {
    columnName: string;
    iconName?: string;
    components?: Partial<ITooltipUiFieldRowComponents>;
}

/** One column of the task under its display name, nothing while empty. */
export const TaskTooltipFieldRow = (props: ITaskTooltipFieldRowProps) => {
    const { gantt, record } = useTaskTooltip();
    const value = record.getFormattedValue(props.columnName);
    if (!value) {
        return null;
    }
    const label = gantt.getTaskRuntime().getProvider().getColumnsMap()[props.columnName]?.displayName ?? props.columnName;
    return <TooltipUiFieldRow label={label} iconName={props.iconName} components={props.components}>{value}</TooltipUiFieldRow>;
};
