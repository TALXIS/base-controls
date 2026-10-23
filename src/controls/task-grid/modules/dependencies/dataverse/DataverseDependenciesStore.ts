import type { IPcfContext } from "@interfaces";
import type { ITaskRuntime } from "../../../runtime";
import type { ITaskDependenciesStore, ITaskDependency, ITaskDependencyCreate, TaskDependencyType } from "../Dependencies";

/** A Dataverse table of dependencies: two task lookups and an option set of the type. */
export interface IDataverseDependenciesSchema {
    entityName: string;
    primaryIdAttribute: string;
    /** Lookup to the task that comes first. */
    predecessorAttribute: string;
    successorAttribute: string;
    /** Option set holding the type. */
    typeAttribute: string;
    /** Every value the option set holds. */
    dependencyTypeCodes: Record<number, TaskDependencyType>;
}

export interface IDataverseDependenciesStoreParameters extends IDataverseDependenciesSchema {
    taskRuntime: ITaskRuntime;
}

const MAX_IDS_PER_REQUEST = 800;

/** Dependencies kept in a Dataverse table. */
export class DataverseDependenciesStore implements ITaskDependenciesStore {
    private _parameters: IDataverseDependenciesStoreParameters;

    constructor(parameters: IDataverseDependenciesStoreParameters) {
        this._parameters = parameters;
    }

    public async onLoadDependencies(taskIds: string[]): Promise<ITaskDependency[]> {
        const batches: string[][] = [];
        for (let index = 0; index < taskIds.length; index += MAX_IDS_PER_REQUEST) {
            batches.push(taskIds.slice(index, index + MAX_IDS_PER_REQUEST));
        }
        const rows = (await Promise.all(batches.map(batch => this._retrieve(batch)))).flat();
        //a dependency whose ends fall in different batches comes back twice
        const dependencies = new Map<string, ITaskDependency>();
        for (const row of rows) {
            const dependency = this._toDependency(row);
            if (dependency) {
                dependencies.set(dependency.id, dependency);
            }
        }
        return [...dependencies.values()];
    }

    public async onCreateDependency(_dependency: ITaskDependencyCreate): Promise<ITaskDependency> {
        throw new Error('Not implemented.');
    }

    public async onUpdateDependency(_dependency: ITaskDependency): Promise<void> {
        throw new Error('Not implemented.');
    }

    public async onDeleteDependency(_dependencyId: string): Promise<void> {
        throw new Error('Not implemented.');
    }

    private async _retrieve(taskIds: string[]): Promise<ComponentFramework.WebApi.Entity[]> {
        const { entityName, primaryIdAttribute, predecessorAttribute, successorAttribute, typeAttribute } = this._parameters;
        const ids = taskIds.map(id => `'${id}'`).join(',');
        const filter = `Microsoft.Dynamics.CRM.In(PropertyName='${predecessorAttribute}',PropertyValues=[${ids}]) or Microsoft.Dynamics.CRM.In(PropertyName='${successorAttribute}',PropertyValues=[${ids}])`;
        const select = [primaryIdAttribute, `_${predecessorAttribute}_value`, `_${successorAttribute}_value`, typeAttribute].join(',');
        const pcfContext: IPcfContext = this._parameters.taskRuntime.services.get('pcfContext');
        const { entities } = await pcfContext.webAPI.retrieveMultipleRecords(entityName, `?$select=${select}&$filter=${filter}`);
        return entities;
    }

    private _toDependency(row: ComponentFramework.WebApi.Entity): ITaskDependency | null {
        const { primaryIdAttribute, predecessorAttribute, successorAttribute, typeAttribute, dependencyTypeCodes } = this._parameters;
        const predecessorTaskId: string | null = row[`_${predecessorAttribute}_value`];
        const successorTaskId: string | null = row[`_${successorAttribute}_value`];
        if (!predecessorTaskId || !successorTaskId) {
            return null;
        }
        const type = dependencyTypeCodes[row[typeAttribute]];
        if (!type) {
            throw new Error(`${typeAttribute} value ${row[typeAttribute]} is not in dependencyTypeCodes.`);
        }
        return { id: row[primaryIdAttribute], predecessorTaskId, successorTaskId, type };
    }
}
