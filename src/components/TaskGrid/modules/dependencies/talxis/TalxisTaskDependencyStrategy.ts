import { DataverseTaskDependencyStrategy, IDataverseTaskDependencyStrategyParams } from "../dataverse/DataverseTaskDependencyStrategy";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/**
 * The `talxis_taskdependency` table as {@link DataverseTaskDependencyStrategy} needs it described: the two
 * task lookups, the option set, and what its values mean — the grid works in link types, not option-set
 * values, so nothing here can be inferred.
 */
const SCHEMA: Omit<IDataverseTaskDependencyStrategyParams, 'services'> = {
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

export interface ITalxisTaskDependencyStrategyParams {
    /**
     * Where the task side is reached: a deleted task's dependencies leave the grid, and a task whose form
     * was just closed has its dependencies reloaded.
     */
    services: ITaskGridServiceLocator;
}

/**
 * Ready-to-use {@link ITaskDependencyStrategy} for the Talxis platform on Dataverse: a
 * {@link DataverseTaskDependencyStrategy} with the `talxis_taskdependency` schema already filled in, so an
 * environment running that table needs nothing but the locator.
 *
 * Everything the base class does it does — reads scoped to the tasks the grid loaded, batched, either end
 * counting — and everything it does not: no row is written or deleted here, so a deactivated dependency is
 * still counted, and a dependency only leaves the grid when its row goes with the task.
 *
 * On top of that it reloads a task whose form was just closed, because on this platform the form is where
 * dependencies are edited.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetDependenciesModule: ({ services }) => createDependenciesModule({
 *         strategy: new TalxisTaskDependencyStrategy({ services }),
 *         services,
 *     }),
 * }
 * ```
 */
export class TalxisTaskDependencyStrategy extends DataverseTaskDependencyStrategy {
    constructor(params: ITalxisTaskDependencyStrategyParams) {
        super({ ...SCHEMA, services: params.services });
        this._registerEventListeners(params.services);
    }

    //reloads a task's dependencies when its form closes. The form is where they are edited here, so what the grid holds
    //for that task is stale the moment it is reopened. Waits for the task provider rather than resolving it: the grid
    //builds its modules first, so there is nothing to reach at construction.
    private _registerEventListeners(services: ITaskGridServiceLocator): void {
        services.whenAvailable('taskDataProvider', ({ taskEvents }) => {
            taskEvents.addEventListener('onAfterDatasetItemsOpened', async (entityReferences, isTaskEntity) => {
                //a lookup cell opens a related record, whose ids are not task ids
                if (!isTaskEntity || entityReferences.length === 0) {
                    return;
                }
                //the references, not the result: a dependency row is not the task row, so a form can come
                //back reporting nothing updated while the dependencies changed. And a null result is the
                //normal case, not a failure - the event is only dispatched once the strategy has returned
                const taskIds = entityReferences.map(reference => reference.id.guid);
                await services.get('dependenciesModule').provider.refresh(taskIds);
            });
        });
    }
}
