import type { MemoryTable } from "@core/state";
import type { IDependenciesStore, ITaskDependency, TaskDependencyCreate } from "../Dependencies";
import { simulateBackend, SIMULATED_LOAD_DELAY_MS } from "../../../runtime/data-sources/memory/simulateBackend";

export class MemoryDependenciesStore implements IDependenciesStore {
    private _dependencies: MemoryTable<ITaskDependency>;

    constructor(dependencies: MemoryTable<ITaskDependency>) {
        this._dependencies = dependencies;
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
}
