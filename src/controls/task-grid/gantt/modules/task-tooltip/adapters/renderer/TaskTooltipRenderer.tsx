import { Card } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";
import { TaskTooltipCallout } from "../callout";
import { TaskTooltipHeader } from "../header";
import { TaskTooltipFieldRows } from "../field-rows";
import { TaskTooltipProgressRow } from "../progress-row";
import { TaskTooltipDateRangeRow } from "../date-range-row";
import { ITaskTooltipRendererComponents } from "./components";

export interface ITaskTooltipRendererProps {
    components?: ITaskTooltipRendererComponents;
}

/** The default tooltip: the task's name and status, its progress when mapped, and when it runs. */
export const TaskTooltipRenderer = (props: ITaskTooltipRendererProps) => {
    const components = props.components ?? {};
    const { gantt } = useTaskTooltip();
    const isProgressMapped = !!gantt.getTaskRuntime().getFieldMapping().percentComplete;

    return <TaskTooltipCallout components={components.callout}>
        <TaskTooltipHeader components={components.header} />
        {isProgressMapped && <Card.Body components={components.body}>
            <TaskTooltipFieldRows components={components.fieldRows}>
                <TaskTooltipProgressRow components={components.progress} />
            </TaskTooltipFieldRows>
        </Card.Body>}
        <Card.Footer components={components.footer}>
            <TaskTooltipFieldRows components={components.fieldRows}>
                <TaskTooltipDateRangeRow components={components.dateRange} />
            </TaskTooltipFieldRows>
        </Card.Footer>
    </TaskTooltipCallout>;
};
