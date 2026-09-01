import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { ErrorHelper } from "@utils";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** Anything a strategy carries on a project beyond the fields the grid names itself. */
export type ProjectData = { [columnName: string]: any };

/**
 * The project the grid's tasks belong to, as the grid sees it.
 *
 * @typeParam TData What this project's strategy carries in `data` — see `IDataverseProjectData` for the
 * shape the Dataverse side needs.
 */
export interface IProject<TData extends ProjectData = ProjectData> {
    /** The project record's id. */
    id: string;
    /** What it is called, when the project has a name to show. */
    name?: string;
    /** Where the project starts, when it has a start. */
    startDate?: Date;
    /** Where it ends, when it has an end. */
    endDate?: Date;
    /**
     * Whatever else the strategy carries — the project's own columns, and whatever its platform needs of
     * the project that the grid has no field for.
     */
    data?: TData;
}

/** Where the project is read from. */
export interface IProjectStrategy<TData extends ProjectData = ProjectData> {
    /** Wherever the truth lives, the server included, this is where the project is read. */
    onGetProject: () => Promise<IProject<TData>>;
}

/** Lifecycle events for the project load. */
export interface IProjectProviderEvents<TData extends ProjectData = ProjectData> {
    onBeforeProjectRefreshed: () => void;
    /** @param project The project as it now stands. The Gantt's project markers follow this. */
    onAfterProjectRefreshed: (project: IProject<TData>) => void;
    onError: (error: any, message: string) => void;
}

export interface IProjectProviderParameters<TData extends ProjectData = ProjectData> {
    /** Where the project is read from. */
    strategy: IProjectStrategy<TData>;
    /** Where the task side and the other modules are reached. Resolve in methods, never in a constructor. */
    services: ITaskGridServiceLocator;
}

/** The project as it was loaded. */
export interface IProjectProvider<TData extends ProjectData = ProjectData> {
    /** Lifecycle events. */
    events: IEventEmitter<IProjectProviderEvents<TData>>;
    /** Reads the project through the strategy, reports it, and hands it back. */
    refresh: () => Promise<IProject<TData>>;
    /**
     * The project. There is always one — the strategy answers with a project or fails.
     * @throws Before the first refresh completed, which the grid does as it loads.
     */
    getProject: () => IProject<TData>;
}

/**
 * An {@link IProjectStrategy} with what it loaded kept for whoever asks.
 *
 * Refreshed once, by the grid, as it finishes loading — the same way the dependencies and checklist
 * providers are driven. Built by `createProjectModule`, never constructed directly by a consumer.
 */
export class ProjectProvider<TData extends ProjectData = ProjectData> implements IProjectProvider<TData> {
    public events = new EventEmitter<IProjectProviderEvents<TData>>();
    private _strategy: IProjectStrategy<TData>;
    private _services: ITaskGridServiceLocator;
    private _project?: IProject<TData>;

    constructor(parameters: IProjectProviderParameters<TData>) {
        this._strategy = parameters.strategy;
        this._services = parameters.services;
        this._registerCleanup();
    }

    public async refresh(): Promise<IProject<TData>> {
        return await ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                this.events.dispatchEvent('onBeforeProjectRefreshed');
                const project = await this._strategy.onGetProject();
                this._project = project;
                this.events.dispatchEvent('onAfterProjectRefreshed', project);
                return project;
            },
            onError: (error, message) => this.events.dispatchEvent('onError', error, message),
        });
    }

    public getProject(): IProject<TData> {
        if (!this._project) {
            throw new Error('The project has not been loaded yet. The grid refreshes it as it loads, so it is only there after that.');
        }
        return this._project;
    }

    //releases the provider's listeners when the control it belongs to goes away. Waited for rather than resolved: the
    //module is built before the control exists.
    private _registerCleanup(): void {
        this._services.whenAvailable('datasetControl', datasetControl => {
            datasetControl.events.addEventListener('onBeforeDestroy', () => this.events.clearEventListeners());
        });
    }
}
