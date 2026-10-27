import type { IRecord } from "@talxis/client-libraries";
import { ErrorHelper } from "@utils/error-handling";
import type { ICreateTaskOptions, IEditTasksResult, ITaskDataProvider, ITaskMovePosition } from "../../provider";
import type { ITaskGridLabels } from "../../labels";
import type { ITaskRuntime } from "../interfaces";

/** The task actions, each run with the grid loading and its error shown. */
export interface ITaskActions {
    /** @returns The created task, or `null` when creation is off or the user cancelled. */
    create(parentId?: string, options?: ICreateTaskOptions): Promise<IRecord | null>;
    edit(taskIds: string[]): Promise<IEditTasksResult | null>;
    /** Confirms, deletes the tasks with their subtrees, and reports any it could not delete. */
    delete(taskIds: string[]): Promise<void>;
    /** @returns `true` once moved, or `null` when it did not move. */
    move(taskId: string, targetTaskId: string, position: ITaskMovePosition): Promise<true | null>;
    /** Edits the task, or opens the record its lookup points to when `columnName` is another column. */
    open(reference: ComponentFramework.EntityReference, columnName?: string): Promise<void>;
    openRelatedRecord(reference: ComponentFramework.EntityReference, columnName: string): Promise<void>;
}

/** Runs the provider's task actions with the grid loading, their errors shown, and what the user sees around them. */
export class TaskActions implements ITaskActions {
    private _runtime: ITaskRuntime;

    constructor(runtime: ITaskRuntime) {
        this._runtime = runtime;
    }

    public async create(parentId?: string, options?: ICreateTaskOptions): Promise<IRecord | null> {
        if (!this._runtime.isCreationEnabled()) {
            return null;
        }
        const task = await this._execute(() => this._provider.createTask(parentId, options), 'creatingTask', 'createTaskFailed');
        if (task) {
            this._runtime.services.find('taskTree')?.focusNewTask(task.getRecordId());
        }
        return task;
    }

    public async edit(taskIds: string[]): Promise<IEditTasksResult | null> {
        return this._execute(() => this._provider.editTasks(taskIds), 'editingTasks', 'editTasksFailed');
    }

    public async delete(taskIds: string[]): Promise<void> {
        if (!this._runtime.isDeletionEnabled()) {
            return;
        }
        const navigation = this._runtime.services.get('pcfContext').navigation;
        const labels = this._runtime.getLabels();
        const provider = this._provider;
        const { deletableTaskIds, refusedTaskIds } = provider.getDeletion(taskIds);
        if (deletableTaskIds.length === 0) {
            await navigation.openErrorDialog({ message: labels.getLocalizedString('tasksCannotBeDeleted') });
            return;
        }
        const subtaskCount = deletableTaskIds.filter(taskId => !taskIds.includes(taskId)).length;
        const text = subtaskCount > 0 ? labels.getLocalizedString('confirmDeleteTasksWithSubtasks', { count: String(subtaskCount) }) : labels.getLocalizedString('confirmDeleteTasks');
        const confirmation = await navigation.openConfirmDialog({ text });
        if (!confirmation.confirmed) {
            return;
        }
        const result = await this._execute(() => provider.deleteTasks(taskIds), 'deletingTasks', 'deleteTasksFailed');
        const failures = [
            ...(result?.success === false ? result.errors : []),
            ...refusedTaskIds.map(id => ({ id, error: labels.getLocalizedString('taskCannotBeDeleted') })),
        ];
        if (failures.length > 0) {
            const subject = this._runtime.getFieldMapping().subject;
            const message = failures.map(failure => `${provider.getRecordsMap()[failure.id]?.getValue(subject) ?? failure.id}: ${ErrorHelper.getMessageFromError(failure.error)}`).join('\n');
            await navigation.openErrorDialog({ message: labels.getLocalizedString('deleteTasksFailed'), details: message });
        }
    }

    public async move(taskId: string, targetTaskId: string, position: ITaskMovePosition): Promise<true | null> {
        return this._execute(() => this._provider.moveTask(taskId, targetTaskId, position), 'movingTask', 'moveTaskFailed');
    }

    public async open(reference: ComponentFramework.EntityReference, columnName?: string): Promise<void> {
        if (!columnName || columnName === this._provider.getFieldMapping().subject) {
            await this.edit([reference.id.guid]);
        }
        else {
            await this.openRelatedRecord(reference, columnName);
        }
    }

    public async openRelatedRecord(reference: ComponentFramework.EntityReference, columnName: string): Promise<void> {
        await this._execute(() => this._provider.openRelatedRecord(reference, columnName), 'openingRecord', 'openRecordFailed');
    }

    private get _provider(): ITaskDataProvider {
        return this._runtime.getProvider();
    }

    private _execute<T>(operation: () => Promise<T>, loadingLabel: keyof ITaskGridLabels, errorLabel: keyof ITaskGridLabels): Promise<T> {
        const labels = this._runtime.getLabels();
        return this._runtime.execute(operation, { loading: { message: labels.getLocalizedString(loadingLabel) }, error: { title: labels.getLocalizedString(errorLabel) } });
    }
}
