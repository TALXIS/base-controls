import { useGanttModule } from "../../../../context";
import { ITooltipUiHeaderComponents, TooltipUiHeader } from "../../../../ui/tooltip";
import { useTaskTooltip } from "../task-tooltip-root";

export interface ITaskTooltipHeaderProps {
    components?: Partial<ITooltipUiHeaderComponents>;
}

/** The task's name, with the status from the module's `statusColumnName` beside it. */
export const TaskTooltipHeader = (props: ITaskTooltipHeaderProps) => {
    const { gantt, record, task } = useTaskTooltip();
    const statusColumnName = useGanttModule('taskTooltip').getStatusColumnName();
    const getStatus = () => {
        const text = statusColumnName && record.getFormattedValue(statusColumnName);
        if (!statusColumnName || !text) {
            return undefined;
        }
        const value = record.getValue(statusColumnName);
        const options = gantt.getTaskRuntime().getProvider().getColumnsMap()[statusColumnName]?.metadata?.OptionSet ?? [];
        return { text, color: options.find(option => String(option.Value) === String(value))?.Color };
    };
    return <TooltipUiHeader title={task.text} status={getStatus()} components={props.components} />;
};
