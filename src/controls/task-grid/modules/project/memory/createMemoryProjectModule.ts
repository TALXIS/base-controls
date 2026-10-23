import { createProjectModule, IProject, IProjectModule, IProjectStore } from "../createProjectModule";

export interface IMemoryProjectModuleParameters<TData> {
    project: IProject<TData>;
}

class MemoryProjectStore<TData> implements IProjectStore<TData> {
    private _project: IProject<TData>;

    constructor(project: IProject<TData>) {
        this._project = project;
    }

    public async onLoadProject(): Promise<IProject<TData>> {
        return this._project;
    }
}

/** The project module for a project held in memory. */
export const createMemoryProjectModule = <TData,>(parameters: IMemoryProjectModuleParameters<TData>): IProjectModule<TData> => {
    return createProjectModule({ onCreateStore: () => new MemoryProjectStore(parameters.project) });
};
