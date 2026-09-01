import { Task } from "gantt-trial";

/** What the task tooltip is rendered with: the hovered task and the event that opened it. */
export interface IGanttTaskTooltipProps {
    task: Task;
    event: MouseEvent;
}

