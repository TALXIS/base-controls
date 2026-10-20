import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { TaskDragging } from "./TaskDragging";

/** Moving tasks by dragging their rows; goes in `TaskDatasetControl`'s `modules.dragging`. */
export interface ITaskDraggingModule extends IDatasetControlModule { }

declare module "../../dataset-control/TaskDatasetControl" {
    interface ITaskDatasetControlModules {
        /** Moving tasks by dragging their rows; needs the operations module with editing on. */
        dragging?: ITaskDraggingModule;
    }
}

/** Moves tasks by dragging their rows: between rows, sideways between levels, or onto another task; not in a flat list. */
export const createTaskDraggingModule = (): ITaskDraggingModule => ({
    onLoad: datasetControl => {
        new TaskDragging(datasetControl.parts.get('taskDatasetControl'));
    },
});
