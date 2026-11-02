import type { IGanttModule } from "../../interfaces";
import { BarDragging, IBarDraggingParameters } from "./BarDragging";

export interface IBarDraggingModule extends IGanttModule<'barDragging'> { }

export const createBarDraggingModule = (parameters: IBarDraggingParameters = {}): IBarDraggingModule => ({
    name: 'barDragging',
    onLoad: gantt => new BarDragging(gantt, parameters),
    onDestroy: barDragging => barDragging.destroy(),
});
