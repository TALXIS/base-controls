import { ITaskDependency, ITaskDependencyStrategy } from "../DependenciesProvider";

/** Constructor parameters for {@link MemoryTaskDependencyStrategy}. */
export interface IMemoryTaskDependencyStrategyParams {
    /**
     * The dependencies. Read only — nothing here writes into the array, so a fixture can be shared
     * between grids.
     */
    dependencies: ITaskDependency[];
}

/**
 * In-memory {@link ITaskDependencyStrategy} — the dependencies come from the array it was given, with no
 * Dataverse and no network. Intended for local development, tests, Storybook and demos.
 *
 * The dependency type is the grid's own {@link TaskDependencyType}, so a fixture names it rather than
 * carrying an option-set code.
 */
export class MemoryTaskDependencyStrategy implements ITaskDependencyStrategy {
    private _dependencies: ITaskDependency[];

    constructor(params: IMemoryTaskDependencyStrategyParams) {
        this._dependencies = params.dependencies;
    }

    public async onGetDependencies(params: { taskIds: string[] }): Promise<ITaskDependency[]> {
        const taskIds = new Set(params.taskIds);
        //copies: what the provider indexes is its own, so a caller cannot reach back into the fixture
        return this._dependencies
            .filter(dependency => taskIds.has(dependency.predecessorTaskId) || taskIds.has(dependency.successorTaskId))
            .map(dependency => ({ ...dependency }));
    }
}
