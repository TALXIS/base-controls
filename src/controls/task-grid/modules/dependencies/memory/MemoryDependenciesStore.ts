import type { IDependenciesStore, ITaskDependency, TaskDependencyCreate } from "../Dependencies";
import { simulateBackend, SIMULATED_LOAD_DELAY_MS } from "../../../runtime/data-sources/memory/simulateBackend";

export class MemoryDependenciesStore implements IDependenciesStore {
    private _dependencies: ITaskDependency[];

    constructor(dependencies: ITaskDependency[]) {
        this._dependencies = structuredClone(dependencies);
    }

    public async onLoadDependencies(taskIds: string[]): Promise<ITaskDependency[]> {
        await simulateBackend(SIMULATED_LOAD_DELAY_MS);
        const loadedTaskIds = new Set(taskIds);
        return this._dependencies.filter(dependency => loadedTaskIds.has(dependency.predecessorTaskId) || loadedTaskIds.has(dependency.successorTaskId));
    }

    public async onCreateDependency(dependency: TaskDependencyCreate): Promise<ITaskDependency> {
        await simulateBackend();
        const created = { ...dependency, id: crypto.randomUUID() };
        this._dependencies.push(created);
        return created;
    }

    public async onUpdateDependency(dependency: ITaskDependency): Promise<void> {
        await simulateBackend();
        this._dependencies = this._dependencies.map(existing => existing.id === dependency.id ? dependency : existing);
    }

    public async onDeleteDependency(dependencyId: string): Promise<void> {
        await simulateBackend();
        this._dependencies = this._dependencies.filter(dependency => dependency.id !== dependencyId);
    }
}
