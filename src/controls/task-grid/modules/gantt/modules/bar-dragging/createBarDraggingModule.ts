import type { IGanttModule } from "../../interfaces";
import { GanttTaskDragging, IGanttTaskDraggingParameters } from "./GanttTaskDragging";

export interface IGanttTaskDraggingModule extends IGanttModule<'taskDragging'> { }

export const createGanttTaskDraggingModule = (parameters: IGanttTaskDraggingParameters = {}): IGanttTaskDraggingModule => ({
    name: 'taskDragging',
    onLoad: gantt => new GanttTaskDragging(gantt, parameters),
    onDestroy: taskDragging => taskDragging.destroy(),
});
