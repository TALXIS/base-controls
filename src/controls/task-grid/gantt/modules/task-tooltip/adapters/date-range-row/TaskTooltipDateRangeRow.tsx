import { IRecordCardDateRangeComponents, RecordCardDateRange } from "@ui";
import { useTaskTooltip } from "../task-tooltip-root";

export interface ITaskTooltipDateRangeRowProps {
    components?: Partial<IRecordCardDateRangeComponents>;
}

/** The task's start, end and duration as the timeline draws them, not as the record holds them. */
export const TaskTooltipDateRangeRow = (props: ITaskTooltipDateRangeRowProps) => {
    const { gantt, span, duration } = useTaskTooltip();
    if (!span) {
        return null;
    }
    const schedule = gantt.services.get('schedule');
    const range = schedule.formatSpan(span).range;
    const formattedDuration = duration ? schedule.formatDuration(duration) : undefined;
    return <RecordCardDateRange range={range} duration={formattedDuration} components={props.components} />;
};
