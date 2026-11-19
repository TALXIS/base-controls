import { IFieldProgressComponents, Field } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";

export interface ITaskTooltipProgressProps {
    components?: Partial<IFieldProgressComponents>;
}

/** The task's `percentComplete` as a bar, an empty value as 0 and nothing when unmapped. */
export const TaskTooltipProgress = (props: ITaskTooltipProgressProps) => {
    const { gantt, record, color } = useTaskTooltip();
    const columnName = gantt.getTaskRuntime().getFieldMapping().percentComplete;
    if (!columnName) {
        return null;
    }
    const value = Number(record.getValue(columnName));
    const percent = Number.isFinite(value) ? value : 0;
    return <Field.Progress percent={percent} text={`${Math.round(percent)}%`} color={color} components={props.components} />;
};
