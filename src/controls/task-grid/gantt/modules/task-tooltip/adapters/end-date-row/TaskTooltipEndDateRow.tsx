import { IRecordCardFieldRowComponents, RecordCardFieldRow } from "@ui";
import { useTaskTooltip } from "../task-tooltip-root";

export interface ITaskTooltipEndDateRowProps {
    /** Defaults to `CalendarReply`. */
    iconName?: string;
    components?: Partial<IRecordCardFieldRowComponents>;
}

/** The task's end as the timeline draws it, not as the record holds it. */
export const TaskTooltipEndDateRow = (props: ITaskTooltipEndDateRowProps) => {
    const { gantt, span } = useTaskTooltip();
    if (!span) {
        return null;
    }
    const schedule = gantt.services.get('schedule');
    return <RecordCardFieldRow label={schedule.getColumnLabels().end} iconName={props.iconName ?? 'CalendarReply'} components={props.components}>{schedule.formatSpan(span).end}</RecordCardFieldRow>;
};
