import type { IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import { Dependencies, IDependenciesParameters } from "./Dependencies";

/** The tasks' dependencies; goes in `TaskDatasetControl`'s `modules`. */
export interface IDependenciesModule extends IDatasetControlModule<'dependencies'> { }

/** Holds the tasks' dependencies and shows their counts in the Predecessors and Successors columns. */
export const createDependenciesModule = (parameters: IDependenciesParameters): IDependenciesModule => ({
    name: 'dependencies',
    onLoad: datasetControl => new Dependencies(datasetControl.parts.get('taskRuntime'), parameters),
    onDestroy: dependencies => dependencies.destroy(),
});
