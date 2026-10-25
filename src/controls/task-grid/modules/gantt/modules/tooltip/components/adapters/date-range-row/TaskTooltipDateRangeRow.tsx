import { ITaskTooltipUiDateRangeComponents, TaskTooltipUiDateRange } from "../../ui";
import { useTaskTooltip } from "../task-tooltip";

export interface ITaskTooltipDateRangeRowProps {
    components?: Partial<ITaskTooltipUiDateRangeComponents>;
}

/** The task's start, end and duration as the timeline draws them, not as the record holds them. */
export const TaskTooltipDateRangeRow = (props: ITaskTooltipDateRangeRowProps) => {
    const { gantt, task } = useTaskTooltip();
    if (!task.start_date || !task.end_date) {
        return null;
    }
    const provider = gantt.getTaskRuntime().getProvider();
    const dates = gantt.services.get('dates');
    const columns = provider.getColumnsMap();
    const formatting = provider.getFormatting();
    const start = formatting.format({ value: task.start_date, column: columns[dates.getStartColumnName()] }) ?? '';
    const end = formatting.format({ value: task.end_date, column: columns[dates.getEndColumnName()] }) ?? '';
    const range = start === end ? start : `${start} – ${end}`;
    const duration = +task.end_date > +task.start_date ? formatting.formatDuration((+task.end_date - +task.start_date) / 60_000) : undefined;
    return <TaskTooltipUiDateRange range={range} duration={duration} components={props.components} />;
};
