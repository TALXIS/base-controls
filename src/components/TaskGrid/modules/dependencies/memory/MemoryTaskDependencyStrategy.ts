import { ITaskDependency, ITaskDependencyStrategy } from "../DependenciesProvider";
import { refreshDependenciesOnTaskDeletion } from "../refreshDependenciesOnTaskDeletion";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** Constructor parameters for {@link MemoryTaskDependencyStrategy}. */
export interface IMemoryTaskDependencyStrategyParams {
    /** Where the task side is reached, so a deleted task takes its dependencies with it. */
    services: ITaskGridServiceLocator;
    /**
     * The dependencies. Written to: deleting a task removes the rows that pointed at it, so hand over
     * the array you keep for the session rather than a shared fixture.
     */
    dependencies: ITaskDependency[];
}

/**
 * In-memory {@link ITaskDependencyStrategy} — the dependencies come from the array it was given, with no
 * Dataverse and no network. Intended for local development, tests, Storybook and demos.
 *
 * The dependency type is the grid's own {@link TaskDependencyType}, so a fixture names it rather than
 * carrying an option-set code.
 *
 * It follows the task side: deleting a task removes the rows that pointed at it, the way a cascade
 * delete would on a real backend.
 */
export class MemoryTaskDependencyStrategy implements ITaskDependencyStrategy {
    private _dependencies: ITaskDependency[];

    constructor(params: IMemoryTaskDependencyStrategyParams) {
        this._dependencies = params.dependencies;
        //the rows go before the reload, which reads back through onGetDependencies
        refreshDependenciesOnTaskDeletion(params.services, taskIds => this._removeDependenciesOf(taskIds));
    }

    public async onGetDependencies(params: { taskIds: string[] }): Promise<ITaskDependency[]> {
        const taskIds = new Set(params.taskIds);
        //copies: what the provider indexes is its own, so a caller cannot reach back into the fixture
        return this._dependencies
            .filter(dependency => taskIds.has(dependency.predecessorTaskId) || taskIds.has(dependency.successorTaskId))
            .map(dependency => ({ ...dependency }));
    }

    /** Splices in place, so the deletion survives in whatever store the array came from. */
    private _removeDependenciesOf(taskIds: string[]): void {
        const deletedTaskIds = new Set(taskIds);
        for (let index = this._dependencies.length - 1; index >= 0; index--) {
            const dependency = this._dependencies[index];
            if (deletedTaskIds.has(dependency.predecessorTaskId) || deletedTaskIds.has(dependency.successorTaskId)) {
                this._dependencies.splice(index, 1);
            }
        }
    }
}
