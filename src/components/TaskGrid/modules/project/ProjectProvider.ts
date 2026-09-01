import { EventEmitter, IEventEmitter, IRecord } from "@talxis/client-libraries";
import { ErrorHelper } from "@utils";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** The project the grid's tasks belong to, as the grid sees it. */
export interface IProject {
    /** Where the project starts, or `null` when it has none. */
    startDate: Date | null;
    /** Where it ends, or `null` when it has none. */
    endDate: Date | null;
    /** The project record itself. */
    entityReference: ComponentFramework.EntityReference;
}

/** Where the project is read from. */
export interface IProjectStrategy {
    /**
     * @param tasks The tasks the grid has loaded — for a project whose span is derived from them rather
     * than stored. Wherever the truth lives, the server included, this is where it is read.
     */
    onGetProject: (params: { tasks: IRecord[] }) => Promise<IProject>;
}

/** Lifecycle events for the project load. */
export interface IProjectProviderEvents {
    onBeforeProjectRefreshed: () => void;
    /** @param project The project as it now stands. The Gantt's project markers follow this. */
    onAfterProjectRefreshed: (project: IProject) => void;
    onError: (error: any, message: string) => void;
}

export interface IProjectProviderParameters {
    /** Where the project is read from. */
    strategy: IProjectStrategy;
    /** Where the task side and the other modules are reached. Resolve in methods, never in a constructor. */
    services: ITaskGridServiceLocator;
    /**
     * The task columns whose edits move the project's dates. A save touching one of them refreshes the
     * project; omit them and only the first load resolves it.
     */
    dateColumnNames?: string[];
}

/** The loaded project, kept current as the tasks change. */
export interface IProjectProvider {
    /** Lifecycle events. */
    events: IEventEmitter<IProjectProviderEvents>;
    /**
     * Reads the project through the strategy and reports it. Driven by the provider itself — on the first
     * data load, and after a save that touched one of `dateColumnNames`.
     * @param tasks The tasks to resolve it from. Defaults to every loaded task.
     */
    refresh: (tasks?: IRecord[]) => Promise<void>;
    /** Where the project starts, or `null` when it has none — or nothing has loaded yet. */
    getStartDate: () => Date | null;
    /** Where it ends, or `null` when it has none — or nothing has loaded yet. */
    getEndDate: () => Date | null;
    /** The project record. `undefined` until the first load completed. */
    getEntityReference: () => ComponentFramework.EntityReference | undefined;
}

/**
 * An {@link IProjectStrategy} with what it loaded kept for whoever asks, and the wiring that keeps it
 * current: the first data load resolves it, and a save that moved a task's dates resolves it again.
 *
 * Built by `createProjectModule`, never constructed directly by a consumer.
 */
export class ProjectProvider implements IProjectProvider {
    public events = new EventEmitter<IProjectProviderEvents>();
    private _strategy: IProjectStrategy;
    private _services: ITaskGridServiceLocator;
    private _dateColumnNames: string[];
    private _project?: IProject;

    constructor(parameters: IProjectProviderParameters) {
        this._strategy = parameters.strategy;
        this._services = parameters.services;
        this._dateColumnNames = parameters.dateColumnNames ?? [];
        this._registerRefresh();
        this._registerCleanup();
    }

    public async refresh(tasks?: IRecord[]): Promise<void> {
        await ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                this.events.dispatchEvent('onBeforeProjectRefreshed');
                const project = await this._strategy.onGetProject({ tasks: tasks ?? this._taskDataProvider.getAllRecords() });
                this._project = project;
                this.events.dispatchEvent('onAfterProjectRefreshed', project);
            },
            onError: (error, message) => this.events.dispatchEvent('onError', error, message),
        });
    }

    public getStartDate(): Date | null {
        return this._project?.startDate ?? null;
    }

    public getEndDate(): Date | null {
        return this._project?.endDate ?? null;
    }

    public getEntityReference(): ComponentFramework.EntityReference | undefined {
        return this._project?.entityReference;
    }

    //nothing outside has to drive the load: the provider follows the task side itself. Waited for rather than resolved
    //— the module is built before the data layer exists.
    private _registerRefresh(): void {
        this._services.whenAvailable('taskDataProvider', provider => {
            provider.addEventListener('onFirstDataLoaded', () => this.refresh());
            provider.addEventListener('onAfterRecordSaved', result => {
                if (!result.success || !result.fields.some(field => this._dateColumnNames.includes(field))) {
                    return;
                }
                this.refresh();
            });
        });
    }

    //releases the provider's listeners when the control it belongs to goes away. Waited for rather than resolved: the
    //module is built before the control exists.
    private _registerCleanup(): void {
        this._services.whenAvailable('datasetControl', datasetControl => {
            datasetControl.events.addEventListener('onBeforeDestroy', () => this.events.clearEventListeners());
        });
    }

    private get _taskDataProvider() {
        return this._services.get('taskDataProvider');
    }
}
