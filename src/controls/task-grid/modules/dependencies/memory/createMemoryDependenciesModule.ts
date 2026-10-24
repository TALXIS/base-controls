import type { IDependenciesParameters, ITaskDependenciesStore, ITaskDependency, ITaskDependencyCreate } from "../Dependencies";
import { createDependenciesModule, IDependenciesModule } from "../createDependenciesModule";
import { simulateDelay } from "../../../data-sources/memory/simulateBackend";

export interface IMemoryDependenciesModuleParameters extends Omit<IDependenciesParameters, 'onCreateStore'> {
    dependencies: ITaskDependency[];
}

class MemoryDependenciesStore implements ITaskDependenciesStore {
    private _dependencies: ITaskDependency[];

    constructor(dependencies: ITaskDependency[]) {
        this._dependencies = structuredClone(dependencies);
    }

    public async onLoadDependencies(taskIds: string[]): Promise<ITaskDependency[]> {
        await simulateDelay(3000);
        const loadedTaskIds = new Set(taskIds);
        return this._dependencies.filter(dependency => loadedTaskIds.has(dependency.predecessorTaskId) || loadedTaskIds.has(dependency.successorTaskId));
    }

    public async onCreateDependency(dependency: ITaskDependencyCreate): Promise<ITaskDependency> {
        await simulateDelay();
        const created = { ...dependency, id: crypto.randomUUID() };
        this._dependencies.push(created);
        return created;
    }

    public async onUpdateDependency(dependency: ITaskDependency): Promise<void> {
        await simulateDelay();
        this._dependencies = this._dependencies.map(existing => existing.id === dependency.id ? dependency : existing);
    }

    public async onDeleteDependency(dependencyId: string): Promise<void> {
        await simulateDelay();
        this._dependencies = this._dependencies.filter(dependency => dependency.id !== dependencyId);
    }
}

/** Dependencies held in memory, starting over on every mount like the memory tasks. */
export const createMemoryDependenciesModule = (parameters: IMemoryDependenciesModuleParameters): IDependenciesModule => {
    const { dependencies, ...moduleParameters } = parameters;
    return createDependenciesModule({ ...moduleParameters, onCreateStore: () => new MemoryDependenciesStore(dependencies) });
};
