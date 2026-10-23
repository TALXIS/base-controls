import { createProjectModule, IProjectModule } from "../createProjectModule";
import type { IProjectData, IProjectStore } from "../Project";

export interface IMemoryProjectModuleParameters<TData> {
    project: IProjectData<TData>;
}

class MemoryProjectStore<TData> implements IProjectStore<TData> {
    private _project: IProjectData<TData>;

    constructor(project: IProjectData<TData>) {
        this._project = project;
    }

    public async onLoadProject(): Promise<IProjectData<TData>> {
        return this._project;
    }
}

/** The project module for a project held in memory. */
export const createMemoryProjectModule = <TData,>(parameters: IMemoryProjectModuleParameters<TData>): IProjectModule => {
    return createProjectModule({ onCreateStore: () => new MemoryProjectStore(parameters.project) });
};
