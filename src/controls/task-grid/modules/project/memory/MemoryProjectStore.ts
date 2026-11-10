import dayjs from "dayjs";
import type { MemoryTable } from "@core/state";
import type { IProjectData, IProjectStore } from "../Project";
import type { IMemoryProject } from "./createMemoryProjectModule";

export class MemoryProjectStore<TData> implements IProjectStore<TData> {
    private _projects: MemoryTable<IMemoryProject<TData>>;
    private _projectId: string;

    constructor(projects: MemoryTable<IMemoryProject<TData>>, projectId: string) {
        this._projects = projects;
        this._projectId = projectId;
    }

    public async loadProject(): Promise<IProjectData<TData>> {
        const project = this._projects.getRow(this._projectId);
        if (!project) {
            throw new Error(`There is no project ${this._projectId} in the table.`);
        }
        const { startDate, endDate, ...rest } = project;
        return { ...rest, startDate: startDate ? dayjs(startDate) : undefined, endDate: endDate ? dayjs(endDate) : undefined };
    }
}
