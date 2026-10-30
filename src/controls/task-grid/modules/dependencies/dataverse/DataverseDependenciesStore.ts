import type { IPcfContext } from "@interfaces";
import type { ITaskRuntime } from "../../../runtime";
import type { ITaskDataProvider } from "../../../provider";
import type { IDependencies, ITaskDependenciesStore, ITaskDependency, ITaskDependencyCreate, TaskDependencyType } from "../Dependencies";

/** A Dataverse table of dependencies: two task lookups and an option set of the type. */
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
    dependencies: IDependencies;
}

const MAX_IDS_PER_REQUEST = 800;

/** Dependencies kept in a Dataverse table. */
export class DataverseDependenciesStore implements ITaskDependenciesStore {
    private _parameters: IDataverseDependenciesStoreParameters;
    private _unregisters: (() => void)[] = [];

    constructor(parameters: IDataverseDependenciesStoreParameters) {
        this._parameters = parameters;
        parameters.taskRuntime.services.whenAvailable('provider', this._onProviderAvailable);
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): void => {
        provider.taskEvents.addEventListener('onEditorClosed', this._onEditorClosed);
        this._unregisters.push(() => provider.taskEvents.removeEventListener('onEditorClosed', this._onEditorClosed));
    };

    //the editor may have changed the task's dependencies
    private _onEditorClosed = (taskIds: string[]): void => {
        this._parameters.dependencies.reload(taskIds);
    };

    public async onLoadDependencies(taskIds: string[]): Promise<ITaskDependency[]> {
        const batches: string[][] = [];
        for (let index = 0; index < taskIds.length; index += MAX_IDS_PER_REQUEST) {
            batches.push(taskIds.slice(index, index + MAX_IDS_PER_REQUEST));
        }
        const primaryIdAttribute = await this._getPrimaryIdAttribute();
        const rows = (await Promise.all(batches.map(batch => this._retrieve(batch, primaryIdAttribute)))).flat();
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

    public async onCreateDependency(dependency: ITaskDependencyCreate): Promise<ITaskDependency> {
        const { id } = await this._getPcfContext().webAPI.createRecord(this._parameters.entityName, await this._toPayload(dependency));
        return { ...dependency, id };
    }

    public async onUpdateDependency(dependency: ITaskDependency): Promise<void> {
        await this._getPcfContext().webAPI.updateRecord(this._parameters.entityName, dependency.id, await this._toPayload(dependency));
    }

    public async onDeleteDependency(dependencyId: string): Promise<void> {
        await this._getPcfContext().webAPI.deleteRecord(this._parameters.entityName, dependencyId);
    }

    private async _getPrimaryIdAttribute(): Promise<string> {
        const metadata: any = await this._getPcfContext().utils.getEntityMetadata(this._parameters.entityName);
        return metadata.PrimaryIdAttribute;
    }

    private async _toPayload(dependency: ITaskDependencyCreate): Promise<ComponentFramework.WebApi.Entity> {
        const { predecessorAttribute, successorAttribute, typeAttribute } = this._parameters;
        const taskEntityName = this._parameters.taskRuntime.getProvider().getEntityName();
        const taskEntitySetName = (await this._getPcfContext().utils.getEntityMetadata(taskEntityName, [])).EntitySetName;
        const navigationPropertyNames = await this._getNavigationPropertyNames(taskEntityName);
        return {
            [`${navigationPropertyNames.get(predecessorAttribute)}@odata.bind`]: `/${taskEntitySetName}(${dependency.predecessorTaskId})`,
            [`${navigationPropertyNames.get(successorAttribute)}@odata.bind`]: `/${taskEntitySetName}(${dependency.successorTaskId})`,
            [typeAttribute]: this._getTypeCode(dependency.type),
        };
    }

    //a lookup is written through its navigation property, which the attribute's name does not give
    private async _getNavigationPropertyNames(taskEntityName: string): Promise<Map<string, string>> {
        const { entityName, predecessorAttribute, successorAttribute } = this._parameters;
        const metadata: any = await this._getPcfContext().utils.getEntityMetadata(entityName);
        const relationships: { ReferencedEntity: string; ReferencingAttribute: string; ReferencingEntityNavigationPropertyName: string }[] = metadata.ManyToOneRelationships.getAll();
        const result = new Map<string, string>();
        for (const attribute of [predecessorAttribute, successorAttribute]) {
            const relationship = relationships.find(relationship => relationship.ReferencedEntity === taskEntityName && relationship.ReferencingAttribute === attribute);
            if (!relationship) {
                throw new Error(`No many-to-one relationship from ${entityName}.${attribute} to ${taskEntityName}.`);
            }
            result.set(attribute, relationship.ReferencingEntityNavigationPropertyName);
        }
        return result;
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

    private async _retrieve(taskIds: string[], primaryIdAttribute: string): Promise<ComponentFramework.WebApi.Entity[]> {
        const { entityName, predecessorAttribute, successorAttribute, typeAttribute } = this._parameters;
        const ids = taskIds.map(id => `'${id}'`).join(',');
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
