import { Task } from "gantt-trial";
import { IMarkerProps } from "./components/marker";

/** What the task tooltip is rendered with: the hovered task and the event that opened it. */
export interface IGanttTaskTooltipProps {
    task: Task;
    event: MouseEvent;
}

/** What one timeline marker is rendered with — the marker itself, plus its positioning props. */
export type IGanttMarkerProps = IMarkerProps;
