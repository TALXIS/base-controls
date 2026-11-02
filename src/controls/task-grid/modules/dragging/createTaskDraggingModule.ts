import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { ITaskDragging, ITaskDraggingParameters, TaskDragging } from "./TaskDragging";

/** Moving tasks by dragging their rows, for `TaskDatasetControl`'s `modules`. */
export interface ITaskDraggingModule extends IDatasetControlModule<'dragging'> { }

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** Moving tasks by dragging their rows, with `enableEditing`. */
        dragging: ITaskDragging;
    }
}

/** Moves tasks by dragging their rows. */
export const createTaskDraggingModule = (parameters: ITaskDraggingParameters = {}): ITaskDraggingModule => ({
    name: 'dragging',
    onLoad: datasetControl => new TaskDragging(datasetControl.parts.get('taskRuntime'), parameters),
    onDestroy: dragging => dragging.destroy(),
});
