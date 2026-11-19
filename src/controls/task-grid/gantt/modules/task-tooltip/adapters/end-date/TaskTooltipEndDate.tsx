import { IFieldValueComponents, Field } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";

export interface ITaskTooltipEndDateProps {
    /** Defaults to `CalendarReply`. */
    iconName?: string;
    components?: Partial<IFieldValueComponents>;
}

/** The task's end as the timeline draws it, not as the record holds it. */
export const TaskTooltipEndDate = (props: ITaskTooltipEndDateProps) => {
    const { gantt, span, milestone } = useTaskTooltip();
    const schedule = gantt.services.get('schedule');
    const text = span ? schedule.formatSpan(span).end : milestone?.edges.includes('end') && schedule.formatDate(milestone.date, 'end');
    if (!text) {
        return null;
    }
    return <Field.Value label={schedule.getColumnLabels().end} iconName={props.iconName ?? 'CalendarReply'} components={props.components}>{text}</Field.Value>;
};
