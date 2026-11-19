import { IFieldListRowComponents, FieldList } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";

export interface ITaskTooltipStartDateRowProps {
    /** Defaults to `Calendar`. */
    iconName?: string;
    components?: Partial<IFieldListRowComponents>;
}

/** The task's start as the timeline draws it, not as the record holds it. */
export const TaskTooltipStartDateRow = (props: ITaskTooltipStartDateRowProps) => {
    const { gantt, span, milestone } = useTaskTooltip();
    const schedule = gantt.services.get('schedule');
    const text = span ? schedule.formatSpan(span).start : milestone?.edges.includes('start') && schedule.formatDate(milestone.date, 'start');
    if (!text) {
        return null;
    }
    return <FieldList.Row label={schedule.getColumnLabels().start} iconName={props.iconName ?? 'Calendar'} components={props.components}>{text}</FieldList.Row>;
};
