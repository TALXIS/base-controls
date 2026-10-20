import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { ITaskOperationsParameters, TaskOperations } from "./TaskOperations";

/** Creating, editing and deleting tasks; goes in `TaskDatasetControl`'s `modules.operations`. */
export interface ITaskOperationsModule extends IDatasetControlModule { }

declare module "../../dataset-control/TaskDatasetControl" {
    interface ITaskDatasetControlModules {
        /** The task operations a mount allows, each off until its flag turns it on. */
        operations?: ITaskOperationsModule;
    }
}

/** Turns on the task operations its flags name. */
export const createTaskOperationsModule = (parameters: ITaskOperationsParameters): ITaskOperationsModule => ({
    onLoad: datasetControl => {
        new TaskOperations(datasetControl.parts.get('taskDatasetControl'), parameters);
    },
});
