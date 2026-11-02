import { createProjectModule, IProjectModule } from "../createProjectModule";
import type { IProjectData } from "../Project";
import { MemoryProjectStore } from "./MemoryProjectStore";

export interface IMemoryProjectModuleParameters<TData> {
    project: IProjectData<TData>;
}

/** The project module for a project held in memory. */
export const createMemoryProjectModule = <TData,>(parameters: IMemoryProjectModuleParameters<TData>): IProjectModule => {
    return createProjectModule({ onCreateStore: () => new MemoryProjectStore(parameters.project) });
};
