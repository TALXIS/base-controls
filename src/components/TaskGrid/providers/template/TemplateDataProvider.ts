import { IDataProvider, IEventEmitter, IRawRecord, IRecord } from "@talxis/client-libraries";

export interface ITemplateDataProviderEvents {
    onBeforeTemplateCreated: (taskId: string) => void;
    onAfterTemplateCreated: (record: IRawRecord | null) => void;
    onError: (error: any, message: string) => void;
}

/**
 * Extended data provider interface for task templates. Adds template creation on top of
 * `IDataProvider`, so the provider that lists the templates is also the one that writes them.
 *
 * Call `createTemplateFromTask` here rather than on `ITaskDataProvider` — the task provider knows
 * nothing about templates.
 */
export interface ITemplateDataProvider extends IDataProvider {
    /** EventEmitter for template lifecycle events (create, error). */
    templateEvents: IEventEmitter<ITemplateDataProviderEvents>;
    /**
     * Captures the given task — and, where the implementation supports it, its subtree — as a template.
     * @returns The created template raw record, or `null` if the operation was cancelled by the user. Throws on unexpected failure.
     */
    createTemplateFromTask(task: IRecord): Promise<IRawRecord | null>;
}
