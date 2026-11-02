import type { IGanttModule } from "../../interfaces";
import { TaskSelection, ITaskSelectionParameters } from "./TaskSelection";

export interface ITaskSelectionModule extends IGanttModule<'taskSelection'> { }

export const createTaskSelectionModule = (parameters: ITaskSelectionParameters = {}): ITaskSelectionModule => ({
    name: 'taskSelection',
    onLoad: gantt => new TaskSelection(gantt, parameters),
    onDestroy: selection => selection.destroy(),
});
