import { Card } from "@ui";
import { useTaskTooltip } from "../task-tooltip-surface/context";
import { TaskTooltipCallout } from "../callout";
import { TaskTooltipHeader } from "../header";
import { TaskTooltipFieldList } from "../field-list";
import { TaskTooltipProgress } from "../progress";
import { TaskTooltipDateRange } from "../date-range";
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
            <TaskTooltipFieldList components={components.fieldList}>
                <TaskTooltipProgress components={components.progress} />
            </TaskTooltipFieldList>
        </Card.Body>}
        <Card.Footer components={components.footer}>
            <TaskTooltipFieldList components={components.fieldList}>
                <TaskTooltipDateRange components={components.dateRange} />
            </TaskTooltipFieldList>
        </Card.Footer>
    </TaskTooltipCallout>;
};
