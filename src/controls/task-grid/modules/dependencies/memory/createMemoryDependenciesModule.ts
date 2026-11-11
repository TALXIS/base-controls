import type { MemoryTable } from "@core/state";
import type { IDependenciesParameters, ITaskDependency } from "../Dependencies";
import { createDependenciesModule, IDependenciesModule } from "../createDependenciesModule";
import { MemoryDependenciesStore } from "./MemoryDependenciesStore";

export interface IMemoryDependenciesModuleParameters extends Omit<IDependenciesParameters, 'createStore'> {
    dependencies: MemoryTable<ITaskDependency>;
}

/** Dependencies kept in the `dependencies` table you pass. */
export const createMemoryDependenciesModule = (parameters: IMemoryDependenciesModuleParameters): IDependenciesModule => {
    const { dependencies, ...moduleParameters } = parameters;
    return createDependenciesModule({ ...moduleParameters, createStore: taskRuntime => new MemoryDependenciesStore({ taskRuntime, dependencies }) });
};
