import { ITaskDependency, ITaskDependencyStrategy } from "../DependenciesProvider";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** Constructor parameters for {@link MemoryTaskDependencyStrategy}. */
export interface IMemoryTaskDependencyStrategyParams {
    /**
     * Where the rest of the grid is reached. Every strategy takes it, whether or not this one has a use
     * for it yet — one shape to remember, and nothing to change when it does.
     */
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
    private _services: ITaskGridServiceLocator;

    constructor(params: IMemoryTaskDependencyStrategyParams) {
        this._dependencies = params.dependencies;
        this._services = params.services;
        this._registerEventListeners();
    }

    public async onGetDependencies(params: { taskIds: string[] }): Promise<ITaskDependency[]> {
        const taskIds = new Set(params.taskIds);
        //copies: what the provider indexes is its own, so a caller cannot reach back into the fixture
        return this._dependencies
            .filter(dependency => taskIds.has(dependency.predecessorTaskId) || taskIds.has(dependency.successorTaskId))
            .map(dependency => ({ ...dependency }));
    }

    /**
     * Follows the task side's deletions: the rows pointing at a deleted task go, and the provider is
     * asked to reload that task so its indexes — and the cells of the tasks at the other end of those
     * rows — catch up.
     *
     * Waits for the task provider rather than resolving it: the grid builds its modules first, so there
     * is nothing to reach at construction.
     */
    private _registerEventListeners(): void {
        this._services.whenAvailable('taskDataProvider', ({ taskEvents }) => {
            taskEvents.addEventListener('onAfterTasksDeleted', async result => {
                //null when the delete was cancelled or failed outright, empty when nothing actually went
                if (!result?.deletedTaskIds.length) {
                    return;
                }
                //removed first: a refresh reads back through onGetDependencies, which would otherwise
                //hand the very rows this is dropping straight back
                this._removeDependenciesOf(result.deletedTaskIds);
                //resolved here, not in the constructor: the module is registered after the strategy it
                //was built from
                await this._services.get('dependenciesModule').provider.refresh(result.deletedTaskIds);
            });
        });
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
