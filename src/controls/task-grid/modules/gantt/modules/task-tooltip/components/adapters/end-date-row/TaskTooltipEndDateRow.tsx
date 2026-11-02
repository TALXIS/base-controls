import { ITooltipUiFieldRowComponents, TooltipUiFieldRow } from "../../../../../components/ui/tooltip";
import { useTaskTooltip } from "../task-tooltip-root";

export interface ITaskTooltipEndDateRowProps {
    /** Defaults to `CalendarReply`. */
    iconName?: string;
    components?: Partial<ITooltipUiFieldRowComponents>;
}

/** The task's end as the timeline draws it, not as the record holds it. */
export const TaskTooltipEndDateRow = (props: ITaskTooltipEndDateRowProps) => {
    const { gantt, span } = useTaskTooltip();
    if (!span) {
        return null;
    }
    const schedule = gantt.services.get('schedule');
    return <TooltipUiFieldRow label={schedule.getColumnLabels().end} iconName={props.iconName ?? 'CalendarReply'} components={props.components}>{schedule.formatSpan(span).end}</TooltipUiFieldRow>;
};
