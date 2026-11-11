import { IRecordCardDateRangeComponents, RecordCardDateRange } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";

export interface ITaskTooltipDateRangeRowProps {
    components?: Partial<IRecordCardDateRangeComponents>;
}

/** The task's start, end and duration as the timeline draws them, not as the record holds them. */
export const TaskTooltipDateRangeRow = (props: ITaskTooltipDateRangeRowProps) => {
    const { gantt, span, milestone, duration } = useTaskTooltip();
    const schedule = gantt.services.get('schedule');
    const range = span ? schedule.formatSpan(span).range : milestone && schedule.formatDate(milestone.date, milestone.edges[0]);
    if (!range) {
        return null;
    }
    const formattedDuration = duration !== undefined ? schedule.formatDuration(duration) : undefined;
    return <RecordCardDateRange range={range} duration={formattedDuration} components={props.components} />;
};
