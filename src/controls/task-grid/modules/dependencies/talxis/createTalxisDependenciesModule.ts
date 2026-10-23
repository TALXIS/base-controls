import type { IDependenciesParameters } from "../Dependencies";
import type { IDependenciesModule } from "../createDependenciesModule";
import { createDataverseDependenciesModule, IDataverseDependenciesSchema } from "../dataverse";

const SCHEMA: IDataverseDependenciesSchema = {
    entityName: 'talxis_taskdependency',
    primaryIdAttribute: 'talxis_taskdependencyid',
    predecessorAttribute: 'talxis_predecessortaskid',
    successorAttribute: 'talxis_successortaskid',
    typeAttribute: 'talxis_dependencytypecode',
    dependencyTypeCodes: {
        742070000: 'finishToStart',
        742070001: 'startToStart',
        742070002: 'finishToFinish',
        742070003: 'startToFinish',
    },
};

export interface ITalxisDependenciesModuleParameters extends Omit<IDependenciesParameters, 'strategy'> { }

/** Dependencies kept in TALXIS's task dependency table. */
export const createTalxisDependenciesModule = (parameters: ITalxisDependenciesModuleParameters = {}): IDependenciesModule => createDataverseDependenciesModule({ ...SCHEMA, ...parameters });
