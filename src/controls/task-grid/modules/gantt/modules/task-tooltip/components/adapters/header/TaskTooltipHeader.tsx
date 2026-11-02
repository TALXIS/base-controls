import { useGanttModule } from "../../../../../context";
import { ITaskTooltipUiHeaderComponents, TaskTooltipUiHeader } from "../../ui";
import { useTaskTooltip } from "../task-tooltip";

export interface ITaskTooltipHeaderProps {
    components?: Partial<ITaskTooltipUiHeaderComponents>;
}

/** The task's name, with the status from the module's `statusColumnName` beside it. */
export const TaskTooltipHeader = (props: ITaskTooltipHeaderProps) => {
    const { gantt, record, task } = useTaskTooltip();
    const statusColumnName = useGanttModule('tooltip').getStatusColumnName();
    const getStatus = () => {
        const text = statusColumnName && record.getFormattedValue(statusColumnName);
        if (!statusColumnName || !text) {
            return undefined;
        }
        const value = record.getValue(statusColumnName);
        const options = gantt.getTaskRuntime().getProvider().getColumnsMap()[statusColumnName]?.metadata?.OptionSet ?? [];
        return { text, color: options.find(option => option.Value == value)?.Color };
    };
    return <TaskTooltipUiHeader title={task.text} status={getStatus()} components={props.components} />;
};
