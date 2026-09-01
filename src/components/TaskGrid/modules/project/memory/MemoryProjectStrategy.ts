import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import { IProject, IProjectStrategy, ProjectData } from "../ProjectProvider";

export interface IMemoryProjectStrategyParams<TData extends ProjectData = ProjectData> {
    /**
     * Where the rest of the grid is reached. Every strategy takes it, whether or not this one has a use
     * for it yet — one shape to remember, and nothing to change when it does.
     */
    services: ITaskGridServiceLocator;
    /** The project to hand back. Deep-cloned on the way in, so a fixture can be shared between grids. */
    project: IProject<TData>;
}

/**
 * In-memory {@link IProjectStrategy} — the project comes from what it was given, with no Dataverse and no
 * network. Intended for local development, tests, Storybook and demos.
 *
 * A project whose span should follow the fixture tasks is computed where those records are and passed in
 * as dates: this reads no tasks, and the grid resolves the project before it loads any.
 */
export class MemoryProjectStrategy<TData extends ProjectData = ProjectData> implements IProjectStrategy<TData> {
    private _project: IProject<TData>;

    constructor(params: IMemoryProjectStrategyParams<TData>) {
        this._project = structuredClone(params.project);
    }

    public async onGetProject(): Promise<IProject<TData>> {
        return this._project;
    }
}
