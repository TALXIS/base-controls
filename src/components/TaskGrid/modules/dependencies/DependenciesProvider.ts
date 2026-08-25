/** How the predecessor and the successor of a dependency relate in time. */
export type TaskDependencyType = 'finishToStart' | 'startToStart' | 'finishToFinish' | 'startToFinish';

/**
 * One dependency between two tasks, as the grid sees it.
 *
 * Only what the grid uses is here — a strategy reading a richer record (an offset, ownership, audit
 * fields) keeps the rest to itself.
 */
export interface ITaskDependency {
    id: string;
    /** The task that must happen first. */
    predecessorTaskId: string;
    /** The task that waits. */
    successorTaskId: string;
    type: TaskDependencyType;
}

/** Where dependencies are read from. */
export interface ITaskDependencyStrategy {
    /**
     * @param taskIds The tasks the grid has loaded. A dependency counts when either endpoint is one of
     * them, so a dependency pointing at a task outside the grid still comes back.
     */
    onGetDependencies: (params: { taskIds: string[] }) => Promise<ITaskDependency[]>;
}

/** The loaded dependencies, indexed so a cell can ask about one task. */
export interface IDependenciesProvider {
    /**
     * Loads the dependencies of the given tasks and builds the lookups the getters read. Awaited by the
     * grid's factory with the tasks it just loaded, before anything renders — which is what lets every
     * getter below be synchronous. Call it again with a wider set as more tasks load.
     */
    refresh: (taskIds: string[]) => Promise<void>;
    /** Everything the last `refresh` loaded. */
    getAll: () => ITaskDependency[];
    getDependency: (dependencyId: string) => ITaskDependency | undefined;
    /** Everything touching the task, both directions. */
    getDependenciesForTask: (taskId: string) => ITaskDependency[];
    /** What the task waits on — the dependencies where it is the successor. */
    getPredecessors: (taskId: string) => ITaskDependency[];
    /** What waits on the task — the dependencies where it is the predecessor. */
    getSuccessors: (taskId: string) => ITaskDependency[];
    hasDependencies: (taskId: string) => boolean;
}

/**
 * An {@link ITaskDependencyStrategy} with the indexes the grid reads it through: load once, then answer
 * per task without going back to the strategy.
 *
 * Built by `createDependenciesModule`, never constructed directly by a consumer.
 */
export class DependenciesProvider implements IDependenciesProvider {
    private _strategy: ITaskDependencyStrategy;
    private _dependencies: ITaskDependency[] = [];
    private _byPredecessor: Map<string, ITaskDependency[]> = new Map();
    private _bySuccessor: Map<string, ITaskDependency[]> = new Map();

    constructor(strategy: ITaskDependencyStrategy) {
        this._strategy = strategy;
    }

    public async refresh(taskIds: string[]): Promise<void> {
        this._dependencies = await this._strategy.onGetDependencies({ taskIds });
        this._buildIndexes();
    }

    public getAll(): ITaskDependency[] {
        return [...this._dependencies];
    }

    public getDependency(dependencyId: string): ITaskDependency | undefined {
        return this._dependencies.find(dependency => dependency.id === dependencyId);
    }

    public getDependenciesForTask(taskId: string): ITaskDependency[] {
        const predecessors = this.getPredecessors(taskId);
        //a self-dependency sits in both indexes, so it would otherwise land in the result twice
        const predecessorIds = new Set(predecessors.map(dependency => dependency.id));
        const successors = this.getSuccessors(taskId).filter(dependency => !predecessorIds.has(dependency.id));
        return [...predecessors, ...successors];
    }

    public getPredecessors(taskId: string): ITaskDependency[] {
        return [...(this._bySuccessor.get(taskId) ?? [])];
    }

    public getSuccessors(taskId: string): ITaskDependency[] {
        return [...(this._byPredecessor.get(taskId) ?? [])];
    }

    public hasDependencies(taskId: string): boolean {
        return this._bySuccessor.has(taskId) || this._byPredecessor.has(taskId);
    }

    //rebuilt rather than patched: a refresh replaces the whole set, so a stale entry cannot survive
    private _buildIndexes(): void {
        this._byPredecessor = new Map();
        this._bySuccessor = new Map();
        for (const dependency of this._dependencies) {
            this._addToIndex(this._byPredecessor, dependency.predecessorTaskId, dependency);
            this._addToIndex(this._bySuccessor, dependency.successorTaskId, dependency);
        }
    }

    private _addToIndex(index: Map<string, ITaskDependency[]>, taskId: string, dependency: ITaskDependency): void {
        const existing = index.get(taskId);
        if (existing) {
            existing.push(dependency);
        }
        else {
            index.set(taskId, [dependency]);
        }
    }
}
