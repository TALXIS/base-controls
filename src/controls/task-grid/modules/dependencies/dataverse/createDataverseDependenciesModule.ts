import { Dependencies, IDependenciesParameters } from "../Dependencies";
import type { IDependenciesModule } from "../createDependenciesModule";
import { DataverseDependenciesStrategy, IDataverseDependenciesSchema } from "./DataverseDependenciesStrategy";

export interface IDataverseDependenciesModuleParameters extends IDataverseDependenciesSchema, Omit<IDependenciesParameters, 'strategy'> { }

/** Dependencies kept in a Dataverse table of two task lookups and a type. */
export const createDataverseDependenciesModule = (parameters: IDataverseDependenciesModuleParameters): IDependenciesModule => {
    const { labels, ...schema } = parameters;
    return {
        name: 'dependencies',
        onLoad: datasetControl => {
            const taskDatasetControl = datasetControl.parts.get('taskDatasetControl');
            const strategy = new DataverseDependenciesStrategy({ ...schema, pcfContext: taskDatasetControl.services.get('pcfContext') });
            return new Dependencies(taskDatasetControl, { labels, strategy });
        },
        onDestroy: dependencies => dependencies.destroy(),
    };
};
