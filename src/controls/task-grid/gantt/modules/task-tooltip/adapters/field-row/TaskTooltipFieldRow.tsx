import { IFieldListRowComponents, FieldList } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";

export interface ITaskTooltipFieldRowProps {
    columnName: string;
    iconName?: string;
    components?: Partial<IFieldListRowComponents>;
}

/** One column of the task under its display name, nothing while empty. */
export const TaskTooltipFieldRow = (props: ITaskTooltipFieldRowProps) => {
    const { gantt, record } = useTaskTooltip();
    const value = record.getFormattedValue(props.columnName);
    if (!value) {
        return null;
    }
    const label = gantt.getTaskRuntime().getProvider().getColumnsMap()[props.columnName]?.displayName ?? props.columnName;
    return <FieldList.Row label={label} iconName={props.iconName} components={props.components}>{value}</FieldList.Row>;
};
