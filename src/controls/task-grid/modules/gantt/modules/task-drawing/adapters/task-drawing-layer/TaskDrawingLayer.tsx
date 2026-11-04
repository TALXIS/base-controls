import { useGanttService } from "../../../../context";
import { TaskDrawingGesture } from "../task-drawing-gesture";

/** Ctrl shows the date under the pointer and Ctrl+drag draws a task above that row. */
export const TaskDrawingLayer = () => {
    const chart = useGanttService('chart');
    const dragging = useGanttService('dragging');
    return chart && dragging ? <TaskDrawingGesture chart={chart} dragging={dragging} /> : null;
};
