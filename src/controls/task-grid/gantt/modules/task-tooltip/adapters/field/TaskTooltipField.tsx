import { getSelectedOptions } from "@data";
import { IFieldValueComponents, Field } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";

export interface ITaskTooltipFieldProps {
    columnName: string;
    iconName?: string;
    components?: Partial<IFieldValueComponents>;
}

/** One column of the task under its display name, an option set's as tags; nothing while empty. */
export const TaskTooltipField = (props: ITaskTooltipFieldProps) => {
    const { gantt, record } = useTaskTooltip();
    const value = record.getFormattedValue(props.columnName);
    if (!value) {
        return null;
    }
    const column = gantt.getTaskRuntime().getProvider().getColumnsMap()[props.columnName];
    const label = column?.displayName ?? props.columnName;
    const options = column ? getSelectedOptions(record.getValue(props.columnName), column) : [];
    return <Field.Value label={label} iconName={props.iconName} components={props.components}>
        {options.length > 0 ? options.map(option => <Field.OptionSet key={option.value} label={option.label} color={option.color} />) : value}
    </Field.Value>;
};
