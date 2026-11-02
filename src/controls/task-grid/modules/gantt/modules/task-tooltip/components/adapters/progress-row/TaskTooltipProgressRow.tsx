import { ITooltipUiProgressComponents, TooltipUiProgress } from "../../../../../components/ui/tooltip";
import { useTaskTooltip } from "../task-tooltip-root";

export interface ITaskTooltipProgressRowProps {
    components?: Partial<ITooltipUiProgressComponents>;
}

/** The task's `percentComplete` as a bar, nothing when unmapped or empty. */
export const TaskTooltipProgressRow = (props: ITaskTooltipProgressRowProps) => {
    const { gantt, record, color } = useTaskTooltip();
    const columnName = gantt.getTaskRuntime().getFieldMapping().percentComplete;
    const value = columnName ? record.getValue(columnName) : null;
    if (!columnName || value == null || value === '') {
        return null;
    }
    const percent = Number(value);
    if (!Number.isFinite(percent)) {
        return null;
    }
    return <TooltipUiProgress percent={percent} text={`${Math.round(percent)}%`} color={color} components={props.components} />;
};
