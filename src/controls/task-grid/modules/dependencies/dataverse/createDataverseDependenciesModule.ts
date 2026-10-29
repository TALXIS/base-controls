import type { IDependenciesParameters } from "../Dependencies";
import { createDependenciesModule, IDependenciesModule } from "../createDependenciesModule";
import { DataverseDependenciesStore, IDataverseDependenciesSchema } from "./DataverseDependenciesStore";

export interface IDataverseDependenciesModuleParameters extends IDataverseDependenciesSchema, Omit<IDependenciesParameters, 'onCreateStore'> { }

/** Dependencies kept in a Dataverse table of two task lookups and a type. */
export const createDataverseDependenciesModule = (parameters: IDataverseDependenciesModuleParameters): IDependenciesModule => {
    return createDependenciesModule({ onCreateStore: (taskRuntime, dependencies) => new DataverseDependenciesStore({ ...parameters, taskRuntime, dependencies }) });
};
