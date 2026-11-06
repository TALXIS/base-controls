import type { IGanttModule } from "../../interfaces";
import { TaskDrawing, ITaskDrawingParameters } from "./TaskDrawing";

export interface ITaskDrawingModule extends IGanttModule<'taskDrawing'> { }

export const createTaskDrawingModule = (parameters: ITaskDrawingParameters = {}): ITaskDrawingModule => ({
    name: 'taskDrawing',
    onLoad: gantt => new TaskDrawing(gantt, parameters),
});
