import type { ColDef } from "ag-grid-community";
import { DataTypes, EventEmitter, IColumn, IEventEmitter, IRecord } from "@talxis/client-libraries";
import type { IGrid } from "@controls/grid";
import { ILocalizationService, LocalizationService } from "@utils";
import type { ITaskDataProvider } from "../../provider";
import type { ITaskRuntime } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { DEPENDENCIES_LABELS, IDependenciesLabels } from "./labels";
import { DependenciesCell } from "./components/adapters/dependencies-cell";
import { PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME } from "./constants";

/** How the two tasks of a dependency relate in time. */
export type TaskDependencyType = 'finishToStart' | 'startToStart' | 'finishToFinish' | 'startToFinish';

/** A dependency between two tasks. */
export interface ITaskDependency {
    id: string;
    /** The task that comes first. */
    predecessorTaskId: string;
    successorTaskId: string;
    type: TaskDependencyType;
}

/** A dependency yet to be created. */
export type ITaskDependencyCreate = Omit<ITaskDependency, 'id'>;

/** Where dependencies are kept; a read-only one throws from the writes. */
export interface ITaskDependenciesStore {
    /** The dependencies touching any of these tasks, at either end. */
    onLoadDependencies(taskIds: string[]): Promise<ITaskDependency[]>;
    onCreateDependency(dependency: ITaskDependencyCreate): Promise<ITaskDependency>;
    onUpdateDependency(dependency: ITaskDependency): Promise<void>;
    onDeleteDependency(dependencyId: string): Promise<void>;
}

export interface IDependenciesParameters {
    onCreateStore: (taskRuntime: ITaskRuntime) => ITaskDependenciesStore;
    /** Overrides for the module's strings. */
    labels?: Partial<IDependenciesLabels>;
}

export interface IDependenciesEvents {
    /** The dependencies of these tasks changed, at either end. */
    onDependenciesChanged: (taskIds: string[]) => void;
}

/** The `dependencies` module: the tasks' dependencies, read and written through its store. */
export interface IDependencies {
    events: IEventEmitter<IDependenciesEvents>;
    getDependencies(): ITaskDependency[];
    /** What the task waits on. */
    getPredecessors(taskId: string): ITaskDependency[];
    /** What waits on the task. */
    getSuccessors(taskId: string): ITaskDependency[];
    /** Whether dependencies can be created, retyped and deleted. */
    isEditable(): boolean;
    /** Whether the dependency may be created: no self-link, duplicate or cycle. */
    canCreateDependency(predecessorTaskId: string, successorTaskId: string): boolean;
    /**
     * Rejects when the store fails.
     * @returns The created dependency, or `null` when it is not allowed.
     */
    createDependency(dependency: ITaskDependencyCreate): Promise<ITaskDependency | null>;
    /**
     * Rejects when the store fails.
     * @returns `false` when there is no such dependency or editing is off.
     */
    updateDependency(dependencyId: string, changes: Pick<ITaskDependency, 'type'>): Promise<boolean>;
    /**
     * Rejects when the store fails.
     * @returns `false` when there is no such dependency or editing is off.
     */
    deleteDependency(dependencyId: string): Promise<boolean>;
    getLabels(): ILocalizationService<IDependenciesLabels>;
    /** Called as the mount goes. */
    destroy(): void;
}

/** Each task's dependencies, held for the grid and written through the store. */
export class Dependencies implements IDependencies {
    public events = new EventEmitter<IDependenciesEvents>();
    private _taskRuntime: ITaskRuntime;
    private _store: ITaskDependenciesStore;
    private _labels: ILocalizationService<IDependenciesLabels>;
    private _dependencies: ITaskDependency[] = [];
    private _byPredecessor = new Map<string, ITaskDependency[]>();
    private _bySuccessor = new Map<string, ITaskDependency[]>();
    private _unregisters: (() => void)[] = [];

    constructor(taskRuntime: ITaskRuntime, parameters: IDependenciesParameters) {
        this._taskRuntime = taskRuntime;
        this._store = parameters.onCreateStore(taskRuntime);
        this._labels = new LocalizationService<IDependenciesLabels>({ ...DEPENDENCIES_LABELS, ...parameters.labels });
        taskRuntime.services.whenAvailable('provider', this._onProviderAvailable);
        taskRuntime.registerGridModule({ onRegister: grid => this._onGridRegistered(grid) });
    }

    public getDependencies(): ITaskDependency[] {
        return [...this._dependencies];
    }

    public getPredecessors(taskId: string): ITaskDependency[] {
        return [...this._bySuccessor.get(taskId) ?? []];
    }

    public getSuccessors(taskId: string): ITaskDependency[] {
        return [...this._byPredecessor.get(taskId) ?? []];
    }

    public isEditable(): boolean {
        return this._taskRuntime.isEditingEnabled();
    }

    public canCreateDependency(predecessorTaskId: string, successorTaskId: string): boolean {
        if (predecessorTaskId === successorTaskId) {
            return false;
        }
        if (this.getSuccessors(predecessorTaskId).some(dependency => dependency.successorTaskId === successorTaskId)) {
            return false;
        }
        return !this._reaches(successorTaskId, predecessorTaskId);
    }

    public async createDependency(dependency: ITaskDependencyCreate): Promise<ITaskDependency | null> {
        if (!this.isEditable() || !this.canCreateDependency(dependency.predecessorTaskId, dependency.successorTaskId)) {
            return null;
        }
        return this._execute(async () => {
            const created = await this._store.onCreateDependency(dependency);
            this._setDependencies([...this._dependencies, created], [created]);
            return created;
        }, 'creatingDependency');
    }

    public async updateDependency(dependencyId: string, changes: Pick<ITaskDependency, 'type'>): Promise<boolean> {
        const existing = this._dependencies.find(dependency => dependency.id === dependencyId);
        if (!this.isEditable() || !existing) {
            return false;
        }
        return this._execute(async () => {
            const updated = { ...existing, ...changes };
            await this._store.onUpdateDependency(updated);
            this._setDependencies(this._dependencies.map(dependency => dependency.id === dependencyId ? updated : dependency), [updated]);
            return true;
        }, 'savingDependency');
    }

    public async deleteDependency(dependencyId: string): Promise<boolean> {
        const existing = this._dependencies.find(dependency => dependency.id === dependencyId);
        if (!this.isEditable() || !existing) {
            return false;
        }
        return this._execute(async () => {
            await this._store.onDeleteDependency(dependencyId);
            this._setDependencies(this._dependencies.filter(dependency => dependency.id !== dependencyId), [existing]);
            return true;
        }, 'deletingDependency');
    }

    public getLabels(): ILocalizationService<IDependenciesLabels> {
        return this._labels;
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
        this.events.clearEventListeners();
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): void => {
        provider.addEventListener('onFirstDataLoaded', this._onFirstDataLoaded);
        provider.taskEvents.addEventListener('onTasksDeleted', this._onTasksDeleted);
        provider.taskEvents.addEventListener('onTasksUpdated', this._onTasksUpdated);
        this._unregisters.push(
            provider.registerAvailableColumns(this._addColumns),
            () => provider.removeEventListener('onFirstDataLoaded', this._onFirstDataLoaded),
            () => provider.taskEvents.removeEventListener('onTasksDeleted', this._onTasksDeleted),
            () => provider.taskEvents.removeEventListener('onTasksUpdated', this._onTasksUpdated),
        );
    };

    private _onFirstDataLoaded = (): void => {
        this._load(Object.keys(this._taskRuntime.getProvider().getRecordsMap()));
    };

    private _onTasksDeleted = (taskIds: string[]): void => {
        const deletedTaskIds = new Set(taskIds);
        const removed = this._dependencies.filter(dependency => deletedTaskIds.has(dependency.predecessorTaskId) || deletedTaskIds.has(dependency.successorTaskId));
        if (removed.length > 0) {
            this._setDependencies(this._dependencies.filter(dependency => !removed.includes(dependency)), removed);
        }
    };

    private _onTasksUpdated = (records: IRecord[]): void => {
        this._load(records.map(record => record.getRecordId()));
    };

    //what was held for the tasks is replaced, including any the load no longer returns
    private async _load(taskIds: string[]): Promise<void> {
        if (taskIds.length === 0) {
            return;
        }
        await this._taskRuntime.execute(async () => {
            const loaded = await this._store.onLoadDependencies(taskIds);
            const loadedTaskIds = new Set(taskIds);
            const loadedIds = new Set(loaded.map(dependency => dependency.id));
            const replaced = this._dependencies.filter(dependency => loadedIds.has(dependency.id) || loadedTaskIds.has(dependency.predecessorTaskId) || loadedTaskIds.has(dependency.successorTaskId));
            this._setDependencies([...this._dependencies.filter(dependency => !replaced.includes(dependency)), ...loaded], [...replaced, ...loaded]);
        }, { loading: { show: false }, error: { title: this._labels.getLocalizedString('loadDependenciesFailed'), rethrow: false } });
    }

    private _setDependencies(dependencies: ITaskDependency[], changed: ITaskDependency[]): void {
        this._dependencies = dependencies;
        this._byPredecessor = this._groupBy(dependencies, dependency => dependency.predecessorTaskId);
        this._bySuccessor = this._groupBy(dependencies, dependency => dependency.successorTaskId);
        const taskIds = new Set(changed.flatMap(dependency => [dependency.predecessorTaskId, dependency.successorTaskId]));
        this.events.dispatchEvent('onDependenciesChanged', [...taskIds]);
    }

    private _groupBy(dependencies: ITaskDependency[], getTaskId: (dependency: ITaskDependency) => string): Map<string, ITaskDependency[]> {
        const groups = new Map<string, ITaskDependency[]>();
        for (const dependency of dependencies) {
            const taskId = getTaskId(dependency);
            groups.set(taskId, [...groups.get(taskId) ?? [], dependency]);
        }
        return groups;
    }

    private _reaches(fromTaskId: string, toTaskId: string): boolean {
        const visited = new Set<string>();
        const pending = [fromTaskId];
        while (pending.length > 0) {
            const taskId = pending.pop()!;
            if (taskId === toTaskId) {
                return true;
            }
            if (!visited.has(taskId)) {
                visited.add(taskId);
                pending.push(...this.getSuccessors(taskId).map(dependency => dependency.successorTaskId));
            }
        }
        return false;
    }

    private _addColumns = (columns: IColumn[]): void => {
        const columnNames: [string, keyof IDependenciesLabels][] = [[PREDECESSORS_COLUMN_NAME, 'predecessors'], [SUCCESSORS_COLUMN_NAME, 'successors']];
        for (const [name, label] of columnNames) {
            if (!columns.some(column => column.name === name)) {
                columns.push({
                    name,
                    displayName: this._labels.getLocalizedString(label),
                    dataType: DataTypes.SingleLineText,
                    isVirtual: true,
                    visualSizeFactor: 100,
                    disableSorting: true,
                    metadata: { IsValidForUpdate: false, SupportedFilterConditionOperators: [] },
                });
            }
        }
    };

    private _onGridRegistered(grid: IGrid<ITaskGridServiceMap>): void {
        grid.services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree + 20);
    }

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        for (const colDef of columnDefs) {
            if (colDef.colId === PREDECESSORS_COLUMN_NAME || colDef.colId === SUCCESSORS_COLUMN_NAME) {
                colDef.cellRenderer = DependenciesCell;
            }
        }
    };

    private _execute<T>(operation: () => Promise<T>, loadingLabel: 'creatingDependency' | 'savingDependency' | 'deletingDependency'): Promise<T> {
        return this._taskRuntime.execute(operation, { loading: { message: this._labels.getLocalizedString(loadingLabel) }, error: { title: this._labels.getLocalizedString('dependenciesFailed') } });
    }
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** The tasks' dependencies. */
        dependencies: IDependencies;
    }
}
