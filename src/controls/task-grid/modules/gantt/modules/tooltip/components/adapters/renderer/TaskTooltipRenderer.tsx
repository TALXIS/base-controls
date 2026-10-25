import { TaskTooltipRoot } from "../task-tooltip";
import { TaskTooltipCallout } from "../callout";
import { TaskTooltipHeader } from "../header";
import { TaskTooltipProgressRow } from "../progress-row";
import { TaskTooltipDateRangeRow } from "../date-range-row";
import { ITaskTooltipRendererComponents } from "./components";

export interface ITaskTooltipRendererProps {
    components?: ITaskTooltipRendererComponents;
}

/** The default tooltip: the task's name and status, its progress, and when it runs. */
export const TaskTooltipRenderer = (props: ITaskTooltipRendererProps) => {
    const components = props.components ?? {};
    return <TaskTooltipRoot>
        <TaskTooltipCallout components={components.callout}>
            <TaskTooltipHeader components={components.header} />
            <TaskTooltipProgressRow components={components.progress} />
            <TaskTooltipDateRangeRow components={components.dateRange} />
        </TaskTooltipCallout>
    </TaskTooltipRoot>;
};
