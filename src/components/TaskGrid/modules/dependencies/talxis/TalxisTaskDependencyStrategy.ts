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

/** Constructor parameters for {@link TalxisTaskDependencyStrategy}. */
export interface ITalxisTaskDependencyStrategyParams {
    /** Where the task side is reached, so a deleted task's dependencies are reloaded out of the grid. */
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
    }
}
