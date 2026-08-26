import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** How the predecessor and the successor of a dependency relate in time. */
export type TaskDependencyType = 'finishToStart' | 'startToStart' | 'finishToFinish' | 'startToFinish';

/** Which end of a dependency is being asked about. */
export type TaskDependencyDirection = 'predecessors' | 'successors';

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

/** Lifecycle events for the dependency load. */
export interface IDependenciesProviderEvents {
    /** @param taskIds The tasks about to be loaded. */
    onBeforeDependenciesRefreshed: (taskIds: string[]) => void;
    /**
     * @param affectedTaskIds The tasks whose dependencies differ now — both ends of every change, so a
     * task the refresh did not name is included when its counterpart changed. Empty when the load matched
     * what was already held.
     */
    onAfterDependenciesRefreshed: (affectedTaskIds: string[]) => void;
}

/** Where dependencies are read from. */
export interface ITaskDependencyStrategy {
    /**
     * @param taskIds The tasks the grid has loaded. A dependency counts when either endpoint is one of
     * them, so a dependency pointing at a task outside the grid still comes back.
     */
    onGetDependencies: (params: { taskIds: string[] }) => Promise<ITaskDependency[]>;
}

/** Constructor parameters for {@link DependenciesProvider}. */
export interface IDependenciesProviderParameters {
    /** Where the dependencies are read from. */
    strategy: ITaskDependencyStrategy;
    /** Where the task side and the other modules are reached. Resolve in methods, never in a constructor. */
    services: ITaskGridServiceLocator;
}

/** The loaded dependencies, indexed so a cell can ask about one task. */
export interface IDependenciesProvider {
    /** Lifecycle events. */
    events: IEventEmitter<IDependenciesProviderEvents>;
    /**
     * Loads the dependencies of the given tasks and builds the lookups the getters read. Awaited by the
     * grid's factory with the tasks it just loaded, before anything renders — which is what lets every
     * getter below be synchronous.
     *
     * Merges rather than replaces: a task the call did not name keeps the dependencies it already has, so
     * refreshing a handful of tasks as they load is safe.
     */
    refresh: (taskIds: string[]) => Promise<void>;
    /**
     * Everything loaded so far, or — given a task — everything touching that task, in both directions.
     * @param taskId Omit for the whole set.
     */
    getDependencies: (taskId?: string) => ITaskDependency[];
    /** What the task waits on: the dependencies where it is the successor. */
    getPredecessors: (taskId: string) => ITaskDependency[];
    /** What waits on the task: the dependencies where it is the predecessor. */
    getSuccessors: (taskId: string) => ITaskDependency[];
    /** One dependency by its own id, not a task's. */
    getDependencyById: (dependencyId: string) => ITaskDependency | undefined;
    /** Whether the task is at either end of anything. */
    hasDependencies: (taskId: string) => boolean;
}

/**
 * An {@link ITaskDependencyStrategy} with the indexes the grid reads it through: load once, then answer
 * per task without going back to the strategy.
 *
 * Built by `createDependenciesModule`, never constructed directly by a consumer.
 */
export class DependenciesProvider implements IDependenciesProvider {
    public events = new EventEmitter<IDependenciesProviderEvents>();
    private _strategy: ITaskDependencyStrategy;
    private _services: ITaskGridServiceLocator;
    private _dependencies: ITaskDependency[] = [];
    private _byPredecessor: Map<string, ITaskDependency[]> = new Map();
    private _bySuccessor: Map<string, ITaskDependency[]> = new Map();

    constructor(parameters: IDependenciesProviderParameters) {
        this._strategy = parameters.strategy;
        this._services = parameters.services;
    }

    public async refresh(taskIds: string[]): Promise<void> {
        this.events.dispatchEvent('onBeforeDependenciesRefreshed', taskIds);
        const loaded = await this._strategy.onGetDependencies({ taskIds });
        const previous = this._dependencies;
        this._dependencies = [...this._untouchedBy(taskIds, loaded), ...loaded];
        this._buildIndexes();
        this.events.dispatchEvent('onAfterDependenciesRefreshed', this._affectedTaskIds(previous, this._dependencies));
    }

    public getDependencies(taskId?: string): ITaskDependency[] {
        if (taskId === undefined) {
            return [...this._dependencies];
        }
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

    public getDependencyById(dependencyId: string): ITaskDependency | undefined {
        return this._dependencies.find(dependency => dependency.id === dependencyId);
    }

    public hasDependencies(taskId: string): boolean {
        return this._bySuccessor.has(taskId) || this._byPredecessor.has(taskId);
    }

    /**
     * The tasks touched by a dependency that is in one of the two sets but not the other — which covers
     * every way a refresh can matter: a dependency appeared, one vanished, an endpoint moved (both the old
     * and the new counterpart differ), or the type changed. Both ends of every such dependency count,
     * which is what puts a task the refresh never named in the result.
     */
    private _affectedTaskIds(previous: ITaskDependency[], next: ITaskDependency[]): string[] {
        const previousKeys = new Set(previous.map(dependency => this._identity(dependency)));
        const nextKeys = new Set(next.map(dependency => this._identity(dependency)));
        const affectedTaskIds: Set<string> = new Set();
        for (const dependency of previous) {
            if (!nextKeys.has(this._identity(dependency))) {
                affectedTaskIds.add(dependency.predecessorTaskId).add(dependency.successorTaskId);
            }
        }
        for (const dependency of next) {
            if (!previousKeys.has(this._identity(dependency))) {
                affectedTaskIds.add(dependency.predecessorTaskId).add(dependency.successorTaskId);
            }
        }
        return [...affectedTaskIds];
    }

    //compared by value, not reference: an untouched dependency comes through as the same object either way
    private _identity(dependency: ITaskDependency): string {
        return `${dependency.id}|${dependency.predecessorTaskId}|${dependency.successorTaskId}|${dependency.type}`;
    }

    /**
     * What a refresh leaves alone: the dependencies it did not speak for. One is dropped when either
     * endpoint is a refreshed task — the load is now the truth for it, including having deleted it — or
     * when the load returned it again, so the same dependency cannot land in the set twice.
     */
    private _untouchedBy(taskIds: string[], loaded: ITaskDependency[]): ITaskDependency[] {
        const refreshedTaskIds = new Set(taskIds);
        const loadedIds = new Set(loaded.map(dependency => dependency.id));
        return this._dependencies.filter(dependency => !loadedIds.has(dependency.id)
            && !refreshedTaskIds.has(dependency.predecessorTaskId)
            && !refreshedTaskIds.has(dependency.successorTaskId));
    }

    //rebuilt rather than patched: the merged set is the whole truth, so a stale entry cannot survive
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
