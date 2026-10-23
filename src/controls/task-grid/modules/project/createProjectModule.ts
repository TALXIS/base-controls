import type { Dayjs } from "dayjs";
import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import type { ITaskRuntime } from "../../runtime";

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

/** Loads the project the tasks belong to; goes in `TaskDatasetControl`'s `modules`. */
export interface IProjectModule<TData = { [key: string]: unknown }> extends IDatasetControlModule<'project'> { }

/** Where the project comes from. */
export interface IProjectStore<TData = { [key: string]: unknown }> {
    /** Called on every mount, before the tasks load. */
    onLoadProject(): Promise<IProject<TData>>;
}

export interface IProjectModuleParameters<TData> {
    onCreateStore: (taskRuntime: ITaskRuntime) => IProjectStore<TData>;
}

/** The project the tasks belong to, loaded on every mount and registered as the `project` module. */
export const createProjectModule = <TData,>(parameters: IProjectModuleParameters<TData>): IProjectModule<TData> => ({
    name: 'project',
    onLoad: datasetControl => parameters.onCreateStore(datasetControl.parts.get('taskRuntime')).onLoadProject(),
});

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** The project the tasks belong to. */
        project: IProject<unknown>;
    }
}
