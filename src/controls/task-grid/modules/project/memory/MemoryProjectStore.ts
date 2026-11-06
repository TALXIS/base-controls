import type { IProjectData, IProjectStore } from "../Project";

export class MemoryProjectStore<TData> implements IProjectStore<TData> {
    private _project: IProjectData<TData>;

    constructor(project: IProjectData<TData>) {
        //structuredClone strips the dayjs prototype from the dates
        this._project = { ...project, data: structuredClone(project.data) };
    }

    public async loadProject(): Promise<IProjectData<TData>> {
        return this._project;
    }
}
