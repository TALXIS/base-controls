import type { Dayjs } from "dayjs";
import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { TaskProject } from "./TaskProject";

/** The project the tasks belong to. */
export interface IProject<TData = { [key: string]: unknown }> {
    id: string;
    name?: string;
    /** The table the project lives in, for code that writes a lookup to it. */
    entityName?: string;
    startDate?: Dayjs;
    endDate?: Dayjs;
    /** What else the project carries, such as its own columns. */
    data?: TData;
}

/** Loads the project the tasks belong to; goes in `TaskDatasetControl`'s `modules.project`. */
export interface IProjectModule<TData = { [key: string]: unknown }> extends IDatasetControlModule { }

export interface IProjectModuleParameters<TData> {
    /** Loads the project; called on every mount, before the tasks load. */
    onLoadProject: () => Promise<IProject<TData>>;
}

/** The project the tasks belong to, loaded on every mount and kept on the task runtime as `project`. */
export const createProjectModule = <TData,>(parameters: IProjectModuleParameters<TData>): IProjectModule<TData> => ({
    onLoad: async datasetControl => {
        new TaskProject(datasetControl.parts.get('taskDatasetControl'), await parameters.onLoadProject());
    },
});

declare module "../../dataset-control/TaskDatasetControl" {
    interface ITaskDatasetControlModules {
        /** The project the tasks belong to. */
        project?: IProjectModule;
    }
}

declare module "../../runtime/interfaces" {
    interface ITaskDatasetControlRuntimeModuleServiceMap {
        /** The project the tasks belong to, while the project module is there. */
        project: IProject<unknown>;
    }
}
