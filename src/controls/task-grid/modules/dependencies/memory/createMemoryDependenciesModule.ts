import type { IDependenciesParameters, ITaskDependency } from "../Dependencies";
import { createDependenciesModule, IDependenciesModule } from "../createDependenciesModule";
import { MemoryDependenciesStore } from "./MemoryDependenciesStore";

export interface IMemoryDependenciesModuleParameters extends Omit<IDependenciesParameters, 'onCreateStore'> {
    dependencies: ITaskDependency[];
}

/** Dependencies held in memory, starting over on every mount like the memory tasks. */
export const createMemoryDependenciesModule = (parameters: IMemoryDependenciesModuleParameters): IDependenciesModule => {
    const { dependencies, ...moduleParameters } = parameters;
    return createDependenciesModule({ ...moduleParameters, onCreateStore: () => new MemoryDependenciesStore(dependencies) });
};
