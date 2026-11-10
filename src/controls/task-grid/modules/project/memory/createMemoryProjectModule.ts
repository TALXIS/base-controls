import type { MemoryTable } from "@core/state";
import { createProjectModule, IProjectModule } from "../createProjectModule";
import type { IProjectData } from "../Project";
import { MemoryProjectStore } from "./MemoryProjectStore";

/** A project as a row of the `projects` table, its dates as ISO strings. */
export interface IMemoryProject<TData = { [key: string]: unknown }> extends Omit<IProjectData<TData>, 'startDate' | 'endDate'> {
    startDate?: string;
    endDate?: string;
}

export interface IMemoryProjectModuleParameters<TData> {
    projects: MemoryTable<IMemoryProject<TData>>;
    /** The project of the `projects` table the grid shows. */
    projectId: string;
}

/** The project module for a project kept in the `projects` table you pass. */
export const createMemoryProjectModule = <TData,>(parameters: IMemoryProjectModuleParameters<TData>): IProjectModule => {
    return createProjectModule({ createStore: () => new MemoryProjectStore(parameters.projects, parameters.projectId) });
};
