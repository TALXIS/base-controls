import { Dependencies, IDependenciesParameters, ITaskDependenciesStrategy, ITaskDependency, ITaskDependencyCreate } from "../Dependencies";
import type { IDependenciesModule } from "../createDependenciesModule";

export interface IMemoryDependenciesModuleParameters extends Omit<IDependenciesParameters, 'strategy'> {
    dependencies: ITaskDependency[];
}

class MemoryDependenciesStrategy implements ITaskDependenciesStrategy {
    private _dependencies: ITaskDependency[];

    constructor(dependencies: ITaskDependency[]) {
        this._dependencies = structuredClone(dependencies);
    }

    public async onLoadDependencies(taskIds: string[]): Promise<ITaskDependency[]> {
        const loadedTaskIds = new Set(taskIds);
        return this._dependencies.filter(dependency => loadedTaskIds.has(dependency.predecessorTaskId) || loadedTaskIds.has(dependency.successorTaskId));
    }

    public async onCreateDependency(dependency: ITaskDependencyCreate): Promise<ITaskDependency> {
        const created = { ...dependency, id: crypto.randomUUID() };
        this._dependencies.push(created);
        return created;
    }

    public async onUpdateDependency(dependency: ITaskDependency): Promise<void> {
        this._dependencies = this._dependencies.map(existing => existing.id === dependency.id ? dependency : existing);
    }

    public async onDeleteDependency(dependencyId: string): Promise<void> {
        this._dependencies = this._dependencies.filter(dependency => dependency.id !== dependencyId);
    }
}

/** Dependencies held in memory, starting over on every mount like the memory tasks. */
export const createMemoryDependenciesModule = (parameters: IMemoryDependenciesModuleParameters): IDependenciesModule => {
    const { dependencies, ...moduleParameters } = parameters;
    return {
        name: 'dependencies',
        onLoad: datasetControl => new Dependencies(datasetControl.parts.get('taskDatasetControl'), { ...moduleParameters, strategy: new MemoryDependenciesStrategy(dependencies) }),
        onDestroy: instance => instance.destroy(),
    };
};
