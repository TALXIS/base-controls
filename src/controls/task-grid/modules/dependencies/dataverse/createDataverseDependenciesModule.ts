import type { IDependenciesParameters } from "../Dependencies";
import { createDependenciesModule, IDependenciesModule } from "../createDependenciesModule";
import { DataverseDependenciesStore, IDataverseDependenciesSchema } from "./DataverseDependenciesStore";

export interface IDataverseDependenciesModuleParameters extends IDataverseDependenciesSchema, Omit<IDependenciesParameters, 'createStore'> { }

/** Dependencies kept in a Dataverse table of two task lookups and a type. */
export const createDataverseDependenciesModule = (parameters: IDataverseDependenciesModuleParameters): IDependenciesModule => {
    const { entityName, predecessorAttribute, successorAttribute, typeAttribute, dependencyTypeCodes, ...moduleParameters } = parameters;
    const schema: IDataverseDependenciesSchema = { entityName, predecessorAttribute, successorAttribute, typeAttribute, dependencyTypeCodes };
    return createDependenciesModule({ reloadOnEditorClosed: true, ...moduleParameters, createStore: taskRuntime => new DataverseDependenciesStore({ ...schema, taskRuntime }) });
};
