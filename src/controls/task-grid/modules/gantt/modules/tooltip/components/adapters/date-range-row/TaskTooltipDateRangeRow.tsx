import { ITaskTooltipUiDateRangeComponents, TaskTooltipUiDateRange } from "../../ui";
import { useTaskTooltip } from "../task-tooltip";

export interface ITaskTooltipDateRangeRowProps {
    components?: Partial<ITaskTooltipUiDateRangeComponents>;
}

/** The task's start, end and duration as the timeline draws them, not as the record holds them. */
export const TaskTooltipDateRangeRow = (props: ITaskTooltipDateRangeRowProps) => {
    const { gantt, span, duration } = useTaskTooltip();
    if (!span) {
        return null;
    }
    const range = gantt.services.get('schedule').format(span).range;
    const formattedDuration = duration ? gantt.getTaskRuntime().getProvider().getFormatting().formatDuration(duration) : undefined;
    return <TaskTooltipUiDateRange range={range} duration={formattedDuration} components={props.components} />;
};
