import { ITaskDependency, ITaskDependencyStrategy, TaskDependencyType } from "../DependenciesProvider";
import { refreshDependenciesOnTaskDeletion } from "../refreshDependenciesOnTaskDeletion";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** How many task ids one request filters on. The number the task strategy batches at. */
const MAX_IDS_PER_REQUEST = 800;

/** Constructor parameters for {@link DataverseTaskDependencyStrategy}. */
export interface IDataverseTaskDependencyStrategyParams {
    /** Where the task side is reached, so a deleted task's dependencies are reloaded out of the grid. */
    services: ITaskGridServiceLocator;
    /** The dependency table. */
    entityName: string;
    /** The row's own id. */
    primaryIdAttribute: string;
    /** Lookup to the task that must happen first. */
    predecessorAttribute: string;
    /** Lookup to the task that waits. */
    successorAttribute: string;
    /** Option set holding the link type. */
    typeAttribute: string;
    /** Every option-set value the type attribute can hold. */
    dependencyTypeCodes: Record<number, TaskDependencyType>;
}

/**
 * {@link ITaskDependencyStrategy} implementation for Dataverse: reads dependency rows through the Xrm Web
 * API, filtered to the tasks the grid has loaded.
 *
 * Nothing about the schema is assumed: the table, its attributes and its option set are all told to it,
 * so it serves any table shaped like a dependency — two task lookups and a link type. Wrap it in
 * `createDependenciesModule({ strategy, services })` and return that from the descriptor's
 * `modules.onGetDependenciesModule`.
 *
 * It follows the task side: after a delete the deleted tasks are reloaded, so their dependencies leave the
 * grid and the cells at the other end of them repaint. Read-only otherwise — it deletes no rows itself, so
 * that only clears anything if the rows actually go with the task. Where the relationship does not cascade
 * the read returns them again, and a cell still counts a dependency on a task that is gone.
 */
export class DataverseTaskDependencyStrategy implements ITaskDependencyStrategy {
    private _params: IDataverseTaskDependencyStrategyParams;

    constructor(params: IDataverseTaskDependencyStrategyParams) {
        this._params = params;
        //no rows to prune first: they live in the table, so the reload is the whole of it
        refreshDependenciesOnTaskDeletion(params.services);
    }

    public async onGetDependencies(params: { taskIds: string[] }): Promise<ITaskDependency[]> {
        //no ids means no filter, and no filter would read the whole table
        if (params.taskIds.length === 0) {
            return [];
        }
        const responses = await Promise.all(this._getBatches(params.taskIds).map(batch => this._retrieve(batch)));
        return this._toDependencies(responses.flat());
    }

    private _getBatches(taskIds: string[]): string[][] {
        const batches: string[][] = [];
        for (let i = 0; i < taskIds.length; i += MAX_IDS_PER_REQUEST) {
            batches.push(taskIds.slice(i, i + MAX_IDS_PER_REQUEST));
        }
        return batches;
    }

    private async _retrieve(taskIds: string[]): Promise<ComponentFramework.WebApi.Entity[]> {
        const { entityName, primaryIdAttribute, predecessorAttribute, successorAttribute, typeAttribute } = this._params;
        const ids = taskIds.map(id => `'${id}'`).join(',');
        //either end counts, so a dependency reaching out of the grid still arrives
        const filter = `(Microsoft.Dynamics.CRM.In(PropertyName='${predecessorAttribute}',PropertyValues=[${ids}])`
            + ` or Microsoft.Dynamics.CRM.In(PropertyName='${successorAttribute}',PropertyValues=[${ids}]))`;
        //the lookups are read in their _value form, while In() above takes the attribute's own name
        const select = [primaryIdAttribute, `_${predecessorAttribute}_value`, `_${successorAttribute}_value`, typeAttribute];
        const { entities } = await window.Xrm.WebApi.retrieveMultipleRecords(
            entityName,
            `?$select=${select.join(',')}&$filter=${filter}`
        );
        return entities;
    }

    private _toDependencies(rows: ComponentFramework.WebApi.Entity[]): ITaskDependency[] {
        const { primaryIdAttribute, predecessorAttribute, successorAttribute, typeAttribute } = this._params;
        //keyed by id: a dependency whose two ends fall in different batches comes back from both requests
        const dependencies: Map<string, ITaskDependency> = new Map();
        for (const row of rows) {
            const predecessorTaskId: string | null = row[`_${predecessorAttribute}_value`];
            const successorTaskId: string | null = row[`_${successorAttribute}_value`];
            //a row missing an end links nothing, and there is nothing for a cell to count
            if (!predecessorTaskId || !successorTaskId) {
                continue;
            }
            const id: string = row[primaryIdAttribute];
            dependencies.set(id, {
                id: id,
                predecessorTaskId: predecessorTaskId,
                successorTaskId: successorTaskId,
                type: this._getType(row[typeAttribute]),
            });
        }
        return [...dependencies.values()];
    }

    /**
     * TEMPORARY: an unmapped option-set value should never happen — `dependencyTypeCodes` is meant to
     * name every value the attribute can hold. Until that is proven against real data this falls back to
     * finish-to-start and warns, rather than failing the whole load over one row. Make it throw once the
     * mapping is trusted.
     */
    private _getType(code: unknown): TaskDependencyType {
        const type = this._params.dependencyTypeCodes[code as number];
        if (type) {
            return type;
        }
        console.warn(`[TaskGrid] ${this._params.typeAttribute} value ${code} is not in dependencyTypeCodes; treating it as finishToStart.`);
        return 'finishToStart';
    }
}
