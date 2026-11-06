import type { ColDef } from "ag-grid-community";
import { EventEmitter, IColumn, IEntityReference, IRecord } from "@talxis/client-libraries";
import type { IGrid } from "@controls/grid";
import type { LabelsOf } from "@labels";
import type { ITaskDataProvider } from "../../runtime/provider";
import type { ITaskRuntime, TaskSavingChainLinksHook } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { createReadOnlyLookupColumn, TaskColumnValues } from "../../runtime/column-values";
import { DEPENDENCIES_LABELS } from "./labels";
import { DependenciesCell } from "./adapters/dependencies-cell";
import { PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME } from "./constants";
import type { IDependenciesUiCountComponents } from "./ui/dependency-count";
import type { IEventSubscriber } from "@core";

const DEPENDENCY_COLUMN_NAMES = [PREDECESSORS_COLUMN_NAME, SUCCESSORS_COLUMN_NAME];

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

/** What the reference to a dependency's other task carries on a task's record. */
export interface ITaskDependencyData {
    dependencyId: string;
    type: TaskDependencyType;
}

/** A dependency yet to be created. */
export type TaskDependencyCreate = Omit<ITaskDependency, 'id'>;

/** Where dependencies are kept. */
export interface IDependenciesStore {
    /** The dependencies touching any of these tasks, at either end. */
    loadDependencies(taskIds: string[]): Promise<ITaskDependency[]>;
    createDependency(dependency: TaskDependencyCreate): Promise<ITaskDependency>;
    updateDependency(dependency: ITaskDependency): Promise<void>;
    deleteDependency(dependencyId: string): Promise<void>;
    /** Called as the dependencies go. */
    destroy?(): void;
}

/** The replaceable parts of what the dependencies draw, by the piece they belong to. */
export interface IDependenciesComponents {
    /** The count in a Predecessors or Successors cell. */
    count?: Partial<IDependenciesUiCountComponents>;
}

export interface IDependenciesParameters {
    createStore: (taskRuntime: ITaskRuntime) => IDependenciesStore;
    /** Loads a task's dependencies again once its editor closes. */
    reloadOnEditorClosed?: boolean;
    components?: IDependenciesComponents;
}

export interface IDependenciesEvents {
    /** The dependencies of these tasks changed, at either end. */
    onDependenciesChanged: (taskIds: string[]) => void;
}

/** The `dependencies` module, read and written through its store. */
export interface IDependencies {
    readonly events: IEventSubscriber<IDependenciesEvents>;
    readonly components: IDependenciesComponents;
    getDependencies(): ITaskDependency[];
    /** What the task waits on. */
    getPredecessors(taskId: string): ITaskDependency[];
    /** What waits on the task. */
    getSuccessors(taskId: string): ITaskDependency[];
    /** What the last load threw, until the next one starts. */
    getError(): unknown;
    /** Loads the tasks' dependencies again, every loaded task's when none are given. */
    reload(taskIds?: string[]): Promise<void>;
    /** Whether dependencies can be created, retyped and deleted. */
    isEditable(): boolean;
    /** Whether either task of the dependency is in a chain being saved. */
    isDependencySaving(dependency: Pick<ITaskDependency, 'predecessorTaskId' | 'successorTaskId'>): boolean;
    /** Whether the dependency may be created without a self-link, duplicate or cycle. */
    canCreateDependency(predecessorTaskId: string, successorTaskId: string): boolean;
    /**
     * Rejects when the store fails.
     * @returns The created dependency, or `null` when it is not allowed.
     */
    createDependency(dependency: TaskDependencyCreate): Promise<ITaskDependency | null>;
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
    /** Called as the mount goes. */
    destroy(): void;
}

type DependencyLoadingLabel = 'dependencies.creatingDependency' | 'dependencies.savingDependency' | 'dependencies.deletingDependency';

/** Each task's dependencies, held for the grid and written through the store. */
export class Dependencies implements IDependencies {
    public events = new EventEmitter<IDependenciesEvents>();
    public readonly components: IDependenciesComponents;
    private _taskRuntime: ITaskRuntime;
    private _store: IDependenciesStore;
    private _dependencies: ITaskDependency[] = [];
    private _byPredecessor = new Map<string, ITaskDependency[]>();
    private _bySuccessor = new Map<string, ITaskDependency[]>();
    private _values: TaskColumnValues;

    constructor(taskRuntime: ITaskRuntime, parameters: IDependenciesParameters) {
        this._taskRuntime = taskRuntime;
        this.components = parameters.components ?? {};
        this._store = parameters.createStore(taskRuntime);
        this._values = new TaskColumnValues({
            taskRuntime,
            columnNames: () => DEPENDENCY_COLUMN_NAMES,
            load: this._loadDependencies,
            errorMessage: () => this._labels.get('dependencies.loadDependenciesFailed'),
            reloadOnEditorClosed: parameters.reloadOnEditorClosed,
        });
        taskRuntime.services.observe('provider', this._onProviderAvailable);
        taskRuntime.services.get('datasetControl').parts.observe('grid', this._onGridAvailable);
        taskRuntime.services.get('savingChains').addLinksHook(this._addDependencyLinks);
    }

    private get _labels(): LabelsOf<typeof DEPENDENCIES_LABELS> {
        return this._taskRuntime.getLabels(DEPENDENCIES_LABELS);
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

    public getError(): unknown {
        return this._values.getError();
    }

    public reload(taskIds?: string[]): Promise<void> {
        return this._values.reload(taskIds);
    }

    public isEditable(): boolean {
        return this._taskRuntime.isEditingEnabled();
    }

    public isDependencySaving(dependency: Pick<ITaskDependency, 'predecessorTaskId' | 'successorTaskId'>): boolean {
        const savingChains = this._taskRuntime.services.get('savingChains');
        return savingChains.isTaskSaving(dependency.predecessorTaskId) || savingChains.isTaskSaving(dependency.successorTaskId);
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

    public async createDependency(dependency: TaskDependencyCreate): Promise<ITaskDependency | null> {
        if (!this.isEditable() || !this.canCreateDependency(dependency.predecessorTaskId, dependency.successorTaskId)) {
            return null;
        }
        return this._executeInChain(dependency, async () => {
            const created = await this._store.createDependency(dependency);
            this._setDependencies([...this._dependencies, created], [created]);
            await this._taskRuntime.getProvider().synchronize();
            return created;
        }, 'dependencies.creatingDependency');
    }

    public async updateDependency(dependencyId: string, changes: Pick<ITaskDependency, 'type'>): Promise<boolean> {
        const existing = this._dependencies.find(dependency => dependency.id === dependencyId);
        if (!this.isEditable() || !existing) {
            return false;
        }
        return this._executeInChain(existing, async () => {
            const updated = { ...existing, ...changes };
            await this._store.updateDependency(updated);
            this._setDependencies(this._dependencies.map(dependency => dependency.id === dependencyId ? updated : dependency), [updated]);
            await this._taskRuntime.getProvider().synchronize();
            return true;
        }, 'dependencies.savingDependency');
    }

    public async deleteDependency(dependencyId: string): Promise<boolean> {
        const existing = this._dependencies.find(dependency => dependency.id === dependencyId);
        if (!this.isEditable() || !existing) {
            return false;
        }
        return this._executeInChain(existing, async () => {
            await this._store.deleteDependency(dependencyId);
            this._setDependencies(this._dependencies.filter(dependency => dependency.id !== dependencyId), [existing]);
            await this._taskRuntime.getProvider().synchronize();
            return true;
        }, 'dependencies.deletingDependency');
    }

    public destroy(): void {
        this._store.destroy?.();
    }

    //both tasks and whatever comes after them stay put until the write and its sync settle
    private _executeInChain<T>(dependency: Pick<ITaskDependency, 'predecessorTaskId' | 'successorTaskId'>, operation: () => Promise<T>, loadingLabel: DependencyLoadingLabel): Promise<T> {
        return this._taskRuntime.services.get('savingChains').track([dependency.predecessorTaskId, dependency.successorTaskId], () => this._execute(operation, loadingLabel));
    }

    private _addDependencyLinks: TaskSavingChainLinksHook = (result, { taskId }) => {
        result.linkedTaskIds.push(...this.getSuccessors(taskId).map(dependency => dependency.successorTaskId));
    };

    private _onProviderAvailable = (provider: ITaskDataProvider): (() => void) => {
        const offTasksDeleted = provider.taskEvents.addEventListener('onTasksDeleted', this._onTasksDeleted);
        const removeColumnsHook = provider.addAvailableColumnsHook(this._addColumns);
        return () => { offTasksDeleted(); removeColumnsHook(); };
    };

    private _onTasksDeleted = (taskIds: string[]): void => {
        const deletedTaskIds = new Set(taskIds);
        const removed = this._dependencies.filter(dependency => deletedTaskIds.has(dependency.predecessorTaskId) || deletedTaskIds.has(dependency.successorTaskId));
        if (removed.length > 0) {
            this._setDependencies(this._dependencies.filter(dependency => !removed.includes(dependency)), removed);
        }
    };

    //replaces everything held for the tasks
    private _loadDependencies = async (taskIds: string[]): Promise<void> => {
        const loaded = await this._store.loadDependencies(taskIds);
        const loadedTaskIds = new Set(taskIds);
        const loadedIds = new Set(loaded.map(dependency => dependency.id));
        const replaced = this._dependencies.filter(dependency => loadedIds.has(dependency.id) || loadedTaskIds.has(dependency.predecessorTaskId) || loadedTaskIds.has(dependency.successorTaskId));
        this._setDependencies([...this._dependencies.filter(dependency => !replaced.includes(dependency)), ...loaded], [...replaced, ...loaded]);
    };

    private _setDependencies(dependencies: ITaskDependency[], changed: ITaskDependency[]): void {
        this._dependencies = dependencies;
        this._byPredecessor = this._groupBy(dependencies, dependency => dependency.predecessorTaskId);
        this._bySuccessor = this._groupBy(dependencies, dependency => dependency.successorTaskId);
        const taskIds = new Set(changed.flatMap(dependency => [dependency.predecessorTaskId, dependency.successorTaskId]));
        this._writeToRecords([...taskIds]);
        this.events.dispatchEvent('onDependenciesChanged', [...taskIds]);
    }

    private _writeToRecords(taskIds: string[]): void {
        this._values.write(new Map(taskIds.map(taskId => [taskId, {
            [PREDECESSORS_COLUMN_NAME]: this.getPredecessors(taskId).map(dependency => this._toReference(dependency.predecessorTaskId, dependency)),
            [SUCCESSORS_COLUMN_NAME]: this.getSuccessors(taskId).map(dependency => this._toReference(dependency.successorTaskId, dependency)),
        }])));
    }

    private _toReference(taskId: string, dependency: ITaskDependency): IEntityReference<ITaskDependencyData> {
        const provider = this._taskRuntime.getProvider();
        return {
            id: { guid: taskId },
            name: provider.getRecordsMap()[taskId]?.getValue(provider.getFieldMapping().subject) ?? '',
            etn: provider.getEntityName(),
            data: { dependencyId: dependency.id, type: dependency.type },
        };
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
        const columnNames: [string, 'dependencies.predecessors' | 'dependencies.successors'][] = [[PREDECESSORS_COLUMN_NAME, 'dependencies.predecessors'], [SUCCESSORS_COLUMN_NAME, 'dependencies.successors']];
        for (const [name, label] of columnNames) {
            if (!columns.some(existing => existing.name === name)) {
                columns.push(createReadOnlyLookupColumn(name, this._labels.get(label)));
            }
        }
    };

    private _onGridAvailable = (grid: IGrid): void => {
        (grid as IGrid<ITaskGridServiceMap>).services.get('columns').addColumnDefinitionsHook(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree + 20);
    };

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        for (const colDef of columnDefs) {
            if (DEPENDENCY_COLUMN_NAMES.includes(colDef.colId!)) {
                colDef.cellRenderer = DependenciesCell;
            }
        }
    };

    private _execute<T>(operation: () => Promise<T>, loadingLabel: DependencyLoadingLabel): Promise<T> {
        return this._taskRuntime.execute(operation, { loading: { message: this._labels.get(loadingLabel) }, error: { title: this._labels.get('dependencies.dependenciesFailed') } });
    }
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** The tasks' dependencies. */
        dependencies: IDependencies;
    }
}
