import { useGanttModule } from "../../../../context";
import { Card, IRecordCardHeaderPartsComponents, OptionTag } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";

export interface ITaskTooltipHeaderProps {
    components?: IRecordCardHeaderPartsComponents;
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
    const status = getStatus();
    const components = props.components ?? {};
    return <Card.Header components={components.header}>
        <Card.Header.Start components={components.headerStart}>
            <Card.Title components={components.title}>{task.text}</Card.Title>
        </Card.Header.Start>
        {status && <Card.Header.End components={components.headerEnd}>
            <OptionTag label={status.text} color={status.color} components={components.status} />
        </Card.Header.End>}
    </Card.Header>;
};
