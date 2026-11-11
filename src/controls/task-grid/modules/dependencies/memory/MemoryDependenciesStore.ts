import type { MemoryTable } from "@core/state";
import type { ITaskRuntime } from "../../../runtime";
import type { ITaskDataProvider } from "../../../runtime/provider";
import type { IDependenciesStore, ITaskDependency, TaskDependencyCreate } from "../Dependencies";
import { simulateBackend, SIMULATED_LOAD_DELAY_MS } from "../../../runtime/data-sources/memory/simulateBackend";

export interface IMemoryDependenciesStoreParameters {
    taskRuntime: ITaskRuntime;
    dependencies: MemoryTable<ITaskDependency>;
}

export class MemoryDependenciesStore implements IDependenciesStore {
    private _dependencies: MemoryTable<ITaskDependency>;

    constructor(parameters: IMemoryDependenciesStoreParameters) {
        this._dependencies = parameters.dependencies;
        parameters.taskRuntime.services.observe('provider', this._onProviderAvailable);
    }

    public async loadDependencies(taskIds: string[]): Promise<ITaskDependency[]> {
        await simulateBackend(SIMULATED_LOAD_DELAY_MS);
        const loadedTaskIds = new Set(taskIds);
        return this._dependencies.getRows(dependency => loadedTaskIds.has(dependency.predecessorTaskId) || loadedTaskIds.has(dependency.successorTaskId));
    }

    public async createDependency(dependency: TaskDependencyCreate): Promise<ITaskDependency> {
        await simulateBackend();
        const created = { ...dependency, id: crypto.randomUUID() };
        this._dependencies.insert([created]);
        return created;
    }

    public async updateDependency(dependency: ITaskDependency): Promise<void> {
        await simulateBackend();
        this._dependencies.update(dependency.id, dependency);
    }

    public async deleteDependency(dependencyId: string): Promise<void> {
        await simulateBackend();
        this._dependencies.delete([dependencyId]);
    }

    //stands in for the cascade a database runs as a task is deleted
    private _onProviderAvailable = (provider: ITaskDataProvider): (() => void) => {
        return provider.taskEvents.addEventListener('onTasksDeleted', this._onTasksDeleted);
    };

    private _onTasksDeleted = (taskIds: string[]): void => {
        const deletedTaskIds = new Set(taskIds);
        const orphans = this._dependencies.getRows(dependency => deletedTaskIds.has(dependency.predecessorTaskId) || deletedTaskIds.has(dependency.successorTaskId));
        this._dependencies.delete(orphans.map(dependency => dependency.id));
    };
}
