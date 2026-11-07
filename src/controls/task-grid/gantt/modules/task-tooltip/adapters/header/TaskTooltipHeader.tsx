import { useGanttModule } from "../../../../context";
import { IRecordCardHeaderPartsComponents, OptionTag, RecordCardHeader, RecordCardHeaderEnd, RecordCardHeaderStart, RecordCardTitle } from "@ui";
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
    return <RecordCardHeader components={components.header}>
        <RecordCardHeaderStart components={components.headerStart}>
            <RecordCardTitle components={components.title}>{task.text}</RecordCardTitle>
        </RecordCardHeaderStart>
        {status && <RecordCardHeaderEnd components={components.headerEnd}>
            <OptionTag label={status.text} color={status.color} components={components.status} />
        </RecordCardHeaderEnd>}
    </RecordCardHeader>;
};
