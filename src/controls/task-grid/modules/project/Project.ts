import type { Dayjs } from "dayjs";
import type { ITaskRuntime } from "../../runtime";

/** The project the tasks belong to, as its store loads it. */
export interface IProjectData<TData = { [key: string]: unknown }> {
    id: string;
    name?: string;
    /** The table the project lives in, for code that writes a lookup to it. */
    entityName?: string;
    startDate?: Dayjs;
    endDate?: Dayjs;
    /** What else the project carries, such as its own columns. */
    data?: TData;
}

/** Where the project comes from. */
export interface IProjectStore<TData = { [key: string]: unknown }> {
    /** Called on every mount, before the tasks load. */
    onLoadProject(): Promise<IProjectData<TData>>;
}

export interface IProjectParameters<TData> {
    onCreateStore: (taskRuntime: ITaskRuntime) => IProjectStore<TData>;
}

/** The `project` module: the project the tasks belong to. */
export interface IProject<TData = { [key: string]: unknown }> {
    getId(): string;
    getName(): string | undefined;
    /** The table the project lives in, for code that writes a lookup to it. */
    getEntityName(): string | undefined;
    getStartDate(): Dayjs | undefined;
    getEndDate(): Dayjs | undefined;
    /** What else the project carries, such as its own columns. */
    getData(): TData | undefined;
}

/** The project the tasks belong to, loaded through its store. */
export class Project<TData = { [key: string]: unknown }> implements IProject<TData> {
    private _store: IProjectStore<TData>;
    private _project!: IProjectData<TData>;

    constructor(taskRuntime: ITaskRuntime, parameters: IProjectParameters<TData>) {
        this._store = parameters.onCreateStore(taskRuntime);
    }

    /** Loads the project; the module awaits it before registering. */
    public async load(): Promise<void> {
        this._project = await this._store.onLoadProject();
    }

    public getId(): string {
        return this._project.id;
    }

    public getName(): string | undefined {
        return this._project.name;
    }

    public getEntityName(): string | undefined {
        return this._project.entityName;
    }

    public getStartDate(): Dayjs | undefined {
        return this._project.startDate;
    }

    public getEndDate(): Dayjs | undefined {
        return this._project.endDate;
    }

    public getData(): TData | undefined {
        return this._project.data;
    }
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** The project the tasks belong to. */
        project: IProject<unknown>;
    }
}
