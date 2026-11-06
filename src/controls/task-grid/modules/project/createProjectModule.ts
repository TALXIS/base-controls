import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { IProjectParameters, Project } from "./Project";

/** Loads the project the tasks belong to, for `TaskDatasetControl`'s `modules`. */
export interface IProjectModule extends IDatasetControlModule<'project'> { }

/** The project the tasks belong to, loaded on every mount as the `project` module. */
export const createProjectModule = <TData,>(parameters: IProjectParameters<TData>): IProjectModule => ({
    name: 'project',
    onLoad: async datasetControl => {
        const project = new Project<TData>(datasetControl.modules.get('taskRuntime'), parameters);
        await project.load();
        return project as Project<unknown>;
    },
    onDestroy: project => project.destroy(),
});
