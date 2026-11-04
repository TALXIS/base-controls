import type { IPcfContext } from "@core/pcf/interfaces";
import type { ITaskRuntime } from "../../../runtime";
import type { IDependenciesStore, ITaskDependency, TaskDependencyCreate, TaskDependencyType } from "../Dependencies";
import { retrieveInBatches } from "../../dataverse";

/** A Dataverse table of dependencies with two task lookups and a type option set. */
export interface IDataverseDependenciesSchema {
    entityName: string;
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

interface IDependencyEntityMetadata {
    primaryIdAttribute: string;
    taskEntitySetName: string;
    //a lookup is written through its navigation property
    navigationPropertyNames: Map<string, string>;
}

/** Dependencies kept in a Dataverse table. */
export class DataverseDependenciesStore implements IDependenciesStore {
    private _parameters: IDataverseDependenciesStoreParameters;
    private _metadata?: IDependencyEntityMetadata;

    constructor(parameters: IDataverseDependenciesStoreParameters) {
        this._parameters = parameters;
    }

    public async onLoadDependencies(taskIds: string[]): Promise<ITaskDependency[]> {
        const { primaryIdAttribute } = await this._getMetadata();
        const rows = await retrieveInBatches(taskIds, ids => this._retrieve(ids, primaryIdAttribute));
        //a dependency whose ends fall in different batches comes back twice
        const dependencies = new Map<string, ITaskDependency>();
        for (const row of rows) {
            const dependency = this._toDependency(row, primaryIdAttribute);
            if (dependency) {
                dependencies.set(dependency.id, dependency);
            }
        }
        return [...dependencies.values()];
    }

    public async onCreateDependency(dependency: TaskDependencyCreate): Promise<ITaskDependency> {
        const { id } = await this._getPcfContext().webAPI.createRecord(this._parameters.entityName, await this._toPayload(dependency));
        return { ...dependency, id };
    }

    public async onUpdateDependency(dependency: ITaskDependency): Promise<void> {
        await this._getPcfContext().webAPI.updateRecord(this._parameters.entityName, dependency.id, await this._toPayload(dependency));
    }

    public async onDeleteDependency(dependencyId: string): Promise<void> {
        await this._getPcfContext().webAPI.deleteRecord(this._parameters.entityName, dependencyId);
    }

    private async _toPayload(dependency: TaskDependencyCreate): Promise<ComponentFramework.WebApi.Entity> {
        const { predecessorAttribute, successorAttribute, typeAttribute } = this._parameters;
        const { taskEntitySetName, navigationPropertyNames } = await this._getMetadata();
        return {
            [`${navigationPropertyNames.get(predecessorAttribute)}@odata.bind`]: `/${taskEntitySetName}(${dependency.predecessorTaskId})`,
            [`${navigationPropertyNames.get(successorAttribute)}@odata.bind`]: `/${taskEntitySetName}(${dependency.successorTaskId})`,
            [typeAttribute]: this._getTypeCode(dependency.type),
        };
    }

    private async _getMetadata(): Promise<IDependencyEntityMetadata> {
        this._metadata ??= await this._loadMetadata();
        return this._metadata;
    }

    private async _loadMetadata(): Promise<IDependencyEntityMetadata> {
        const { entityName, predecessorAttribute, successorAttribute } = this._parameters;
        const taskEntityName = this._parameters.taskRuntime.getProvider().getEntityName();
        const [metadata, taskMetadata]: any[] = await Promise.all([this._getPcfContext().utils.getEntityMetadata(entityName), this._getPcfContext().utils.getEntityMetadata(taskEntityName, [])]);
        const relationships: { ReferencedEntity: string; ReferencingAttribute: string; ReferencingEntityNavigationPropertyName: string }[] = metadata.ManyToOneRelationships.getAll();
        const navigationPropertyNames = new Map<string, string>();
        for (const attribute of [predecessorAttribute, successorAttribute]) {
            const relationship = relationships.find(relationship => relationship.ReferencedEntity === taskEntityName && relationship.ReferencingAttribute === attribute);
            if (!relationship) {
                throw new Error(`No many-to-one relationship from ${entityName}.${attribute} to ${taskEntityName}.`);
            }
            navigationPropertyNames.set(attribute, relationship.ReferencingEntityNavigationPropertyName);
        }
        return { primaryIdAttribute: metadata.PrimaryIdAttribute, taskEntitySetName: taskMetadata.EntitySetName, navigationPropertyNames };
    }

    private _getTypeCode(type: TaskDependencyType): number {
        const entry = Object.entries(this._parameters.dependencyTypeCodes).find(([, value]) => value === type);
        if (!entry) {
            throw new Error(`${type} is not in dependencyTypeCodes.`);
        }
        return Number(entry[0]);
    }

    private _getPcfContext(): IPcfContext {
        return this._parameters.taskRuntime.services.get('pcfContext');
    }

    private async _retrieve(ids: string, primaryIdAttribute: string): Promise<ComponentFramework.WebApi.Entity[]> {
        const { entityName, predecessorAttribute, successorAttribute, typeAttribute } = this._parameters;
        const filter = `Microsoft.Dynamics.CRM.In(PropertyName='${predecessorAttribute}',PropertyValues=[${ids}]) or Microsoft.Dynamics.CRM.In(PropertyName='${successorAttribute}',PropertyValues=[${ids}])`;
        const select = [primaryIdAttribute, `_${predecessorAttribute}_value`, `_${successorAttribute}_value`, typeAttribute].join(',');
        const { entities } = await this._getPcfContext().webAPI.retrieveMultipleRecords(entityName, `?$select=${select}&$filter=${filter}`);
        return entities;
    }

    private _toDependency(row: ComponentFramework.WebApi.Entity, primaryIdAttribute: string): ITaskDependency | null {
        const { predecessorAttribute, successorAttribute, typeAttribute, dependencyTypeCodes } = this._parameters;
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
