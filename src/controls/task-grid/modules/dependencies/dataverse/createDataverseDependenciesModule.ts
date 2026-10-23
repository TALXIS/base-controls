import type { IDependenciesParameters } from "../Dependencies";
import { createDependenciesModule, IDependenciesModule } from "../createDependenciesModule";
import { DataverseDependenciesStore, IDataverseDependenciesSchema } from "./DataverseDependenciesStore";

export interface IDataverseDependenciesModuleParameters extends IDataverseDependenciesSchema, Omit<IDependenciesParameters, 'onCreateStore'> { }

/** Dependencies kept in a Dataverse table of two task lookups and a type. */
export const createDataverseDependenciesModule = (parameters: IDataverseDependenciesModuleParameters): IDependenciesModule => {
    const { labels, ...schema } = parameters;
    return createDependenciesModule({ labels, onCreateStore: taskRuntime => new DataverseDependenciesStore({ ...schema, taskRuntime }) });
};
