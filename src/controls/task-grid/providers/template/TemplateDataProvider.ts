import { IDataProvider, IEventEmitter, IRawRecord, IRecord } from "@talxis/client-libraries";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** What every {@link ITemplateDataProvider} implementation is constructed with. */
export interface ITemplateDataProviderParams {
    /**
     * Where the task side is reached: the grid a template is expanded into, and the one a template is
     * captured from. Everything about a task — its columns, its metadata, its hierarchy — is read off
     * `services.get('taskDataProvider')`.
     *
     * Resolve it when a template operation runs, never during construction: the templates module is
     * built before the task provider exists.
     */
    services: ITaskGridServiceLocator;
}

/** What {@link ITemplateDataProvider.createTasksFromTemplate} needs to describe the tasks it expands to. */
export interface ICreateTasksFromTemplateParams {
    /** The template to expand. */
    templateId: string;
    /**
     * The task the expansion lands under, or omitted for the grid's root. The record rather than its id:
     * it is also what the new tasks' parent lookup points at.
     */
    parentRecord?: IRecord;
}

/** Lifecycle events raised around the two template operations: capturing one, and expanding one. */
export interface ITemplateDataProviderEvents {
    onBeforeTemplateCreated: (taskId: string) => void;
    onAfterTemplateCreated: (record: IRawRecord | null) => void;
    onBeforeTasksFromTemplateCreated: (templateId: string) => void;
    /**
     * The tasks a template expanded into, finished and ready to exist.
     *
     * The task data provider is the first listener and adds them to the grid exactly as they are, so
     * every later listener sees tasks that already exist.
     */
    onAfterTasksFromTemplateCreated: (records: IRawRecord[] | null, parentTaskId?: string) => void;
    onError: (error: any, message: string) => void;
}

/**
 * Extended data provider interface for task templates. Adds both template operations on top of
 * `IDataProvider`, so the provider that lists the templates is also the one that captures and expands
 * them.
 *
 * Both directions live here rather than on `ITaskDataProvider` — the task provider knows nothing about
 * templates. It holds this provider as a dependency and listens for the tasks an expansion resolved;
 * everything this needs about tasks it reads through
 * {@link ITemplateDataProviderParams.onGetTaskDataProvider}.
 */
export interface ITemplateDataProvider extends IDataProvider {
    /** EventEmitter for template lifecycle events (capture, expansion, error). */
    templateEvents: IEventEmitter<ITemplateDataProviderEvents>;
    /**
     * Captures the given task — and, where the implementation supports it, its subtree — as a template.
     * @returns The created template raw record, or `null` if the operation was cancelled by the user. Throws on unexpected failure.
     */
    createTemplateFromTask(task: IRecord): Promise<IRawRecord | null>;
    /**
     * Expands the template into a task and its subtree, landing under the record
     * {@link ICreateTasksFromTemplateParams.parentRecord} names. How the hierarchy is described, and what
     * the tasks are built from, is entirely the implementation's business; adding them to the grid is the
     * task provider's, which acts on {@link ITemplateDataProviderEvents.onAfterTasksFromTemplateCreated}.
     *
     * @returns Every task raw record the template resolved to, root first, or `null` if the operation was cancelled by the user. Throws on unexpected failure.
     */
    createTasksFromTemplate(params: ICreateTasksFromTemplateParams): Promise<IRawRecord[] | null>;
}
