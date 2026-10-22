import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { ITaskDraggingParameters, TaskDragging } from "./TaskDragging";

/** Moving tasks by dragging their rows; goes in `TaskDatasetControl`'s `modules`. */
export interface ITaskDraggingModule extends IDatasetControlModule<'dragging'> { }

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** Moving tasks by dragging their rows; needs `enableEditing`. */
        dragging: TaskDragging;
    }
}

/** Moves tasks by dragging their rows. */
export const createTaskDraggingModule = (parameters: ITaskDraggingParameters = {}): ITaskDraggingModule => ({
    name: 'dragging',
    onLoad: datasetControl => new TaskDragging(datasetControl.parts.get('taskDatasetControl'), parameters),
    onDestroy: dragging => dragging.destroy(),
});
