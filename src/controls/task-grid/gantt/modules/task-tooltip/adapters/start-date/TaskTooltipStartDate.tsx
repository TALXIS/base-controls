import { IFieldValueComponents, Field } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";

export interface ITaskTooltipStartDateProps {
    /** Defaults to `Calendar`. */
    iconName?: string;
    components?: Partial<IFieldValueComponents>;
}

/** The task's start as the timeline draws it, not as the record holds it. */
export const TaskTooltipStartDate = (props: ITaskTooltipStartDateProps) => {
    const { gantt, span, milestone } = useTaskTooltip();
    const schedule = gantt.services.get('schedule');
    const text = span ? schedule.formatSpan(span).start : milestone?.edges.includes('start') && schedule.formatDate(milestone.date, 'start');
    if (!text) {
        return null;
    }
    return <Field.Value label={schedule.getColumnLabels().start} iconName={props.iconName ?? 'Calendar'} components={props.components}>{text}</Field.Value>;
};
