import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { IProjectParameters, Project } from "./Project";

/** Loads the project the tasks belong to; goes in `TaskDatasetControl`'s `modules`. */
export interface IProjectModule extends IDatasetControlModule<'project'> { }

/** The project the tasks belong to, loaded on every mount and registered as the `project` module. */
export const createProjectModule = <TData,>(parameters: IProjectParameters<TData>): IProjectModule => ({
    name: 'project',
    onLoad: async datasetControl => {
        const project = new Project<TData>(datasetControl.parts.get('taskRuntime'), parameters);
        await project.load();
        return project as Project<unknown>;
    },
});
