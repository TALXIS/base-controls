import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { ITaskDraggingParameters, TaskDragging } from "./TaskDragging";

/** Moving tasks by dragging their rows; goes in `TaskDatasetControl`'s `modules`. */
export interface ITaskDraggingModule extends IDatasetControlModule<'dragging'> { }

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** Moving tasks by dragging their rows; needs the operations module with editing on. */
        dragging: TaskDragging;
    }
}

/** Moves tasks by dragging their rows: between rows, sideways between levels, or onto another task; not in a flat list. */
export const createTaskDraggingModule = (parameters: ITaskDraggingParameters = {}): ITaskDraggingModule => ({
    name: 'dragging',
    onLoad: datasetControl => new TaskDragging(datasetControl.parts.get('taskDatasetControl'), parameters),
    onDestroy: dragging => dragging.destroy(),
});
