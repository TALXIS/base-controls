import { IDataProvider, IEventEmitter, IRawRecord, IRecord } from "@talxis/client-libraries";
import { ITaskDataProvider } from "@components/TaskGrid/providers/task";

/** Lifecycle events raised around the two template operations: capturing one, and expanding one. */
export interface ITemplateDataProviderEvents {
    onBeforeTemplateCreated: (taskId: string) => void;
    onAfterTemplateCreated: (record: IRawRecord | null) => void;
    onBeforeTasksFromTemplateCreated: (templateId: string) => void;
    onAfterTasksFromTemplateCreated: (records: IRawRecord[] | null) => void;
    onError: (error: any, message: string) => void;
}

/** What every {@link ITemplateDataProvider} implementation is constructed with. */
export interface ITemplateDataProviderParams {
    /**
     * The task side both template operations work against: the tasks a template expands into, and the
     * task a template is captured from.
     *
     * An accessor, not the instance — the grid resolves the templates module before the task provider
     * exists, so this is called when a template operation runs, never during construction. Descriptors
     * hand it through their module context.
     */
    onGetTaskDataProvider: () => ITaskDataProvider;
}

/**
 * Extended data provider interface for task templates. Adds both template operations on top of
 * `IDataProvider`, so the provider that lists the templates is also the one that captures and expands
 * them.
 *
 * Both directions live here rather than on `ITaskDataProvider` — the task provider knows nothing about
 * templates. What this needs from the task side it gets through
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
     * Expands the template into a task and its subtree beneath `parentTaskId` — the grid's root when
     * omitted. How the hierarchy is described, and how the tasks are created, is entirely the
     * implementation's business.
     *
     * @returns Every created task raw record, root first, or `null` if the operation was cancelled by the user. Throws on unexpected failure.
     */
    createTasksFromTemplate(templateId: string, parentTaskId?: string): Promise<IRawRecord[] | null>;
}
