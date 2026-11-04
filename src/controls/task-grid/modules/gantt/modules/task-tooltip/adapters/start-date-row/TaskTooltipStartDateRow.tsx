import { ITooltipUiFieldRowComponents, TooltipUiFieldRow } from "../../../../ui/tooltip";
import { useTaskTooltip } from "../task-tooltip-root";

export interface ITaskTooltipStartDateRowProps {
    /** Defaults to `Calendar`. */
    iconName?: string;
    components?: Partial<ITooltipUiFieldRowComponents>;
}

/** The task's start as the timeline draws it, not as the record holds it. */
export const TaskTooltipStartDateRow = (props: ITaskTooltipStartDateRowProps) => {
    const { gantt, span } = useTaskTooltip();
    if (!span) {
        return null;
    }
    const schedule = gantt.services.get('schedule');
    return <TooltipUiFieldRow label={schedule.getColumnLabels().start} iconName={props.iconName ?? 'Calendar'} components={props.components}>{schedule.formatSpan(span).start}</TooltipUiFieldRow>;
};
