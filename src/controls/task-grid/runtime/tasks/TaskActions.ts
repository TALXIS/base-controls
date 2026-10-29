import type { IRecord } from "@talxis/client-libraries";
import { ErrorHelper } from "@utils/error-handling";
import type { ICreateTaskOptions, IOpenTasksResult, ITaskDataProvider, ITaskMovePosition } from "../../provider";
import { TASK_GRID_LABELS } from "../../labels";
import type { ITaskRuntime } from "../interfaces";
import { runQuietly } from "../runQuietly";

type TaskLoadingLabel = 'taskGrid.openingTasks' | 'taskGrid.deletingTasks' | 'taskGrid.movingTask' | 'taskGrid.openingRecord';
type TaskErrorLabel = 'taskGrid.openTasksFailed' | 'taskGrid.deleteTasksFailed' | 'taskGrid.moveTaskFailed' | 'taskGrid.openRecordFailed';

/** The task actions, each run under the loading overlay and its error shown. */
export interface ITaskActions {
    /** @returns The created task, or `null` when creation is off or the user cancelled. */
    create(parentId?: string, options?: ICreateTaskOptions): Promise<IRecord | null>;
    /** Opens the tasks in an editor outside the grid, such as a form. */
    open(taskIds: string[]): Promise<IOpenTasksResult | null>;
    /** Confirms, deletes the tasks with their subtrees, and reports any it could not delete. */
    delete(taskIds: string[]): Promise<void>;
    /** Places the task and saves it under the loading overlay; `null` when it cannot go there. */
    move(taskId: string, targetTaskId: string, position: ITaskMovePosition): Promise<true | null>;
    /** Opens the task, or the record its lookup points to when `columnName` is another column. */
    openRecord(reference: ComponentFramework.EntityReference, columnName?: string): Promise<void>;
    openRelatedRecord(reference: ComponentFramework.EntityReference, columnName: string): Promise<void>;
}

/** Runs the provider's task actions under the loading overlay, their errors shown, and what the user sees around them. */
export class TaskActions implements ITaskActions {
    private _runtime: ITaskRuntime;

    constructor(runtime: ITaskRuntime) {
        this._runtime = runtime;
    }

    public async create(parentId?: string, options?: ICreateTaskOptions): Promise<IRecord | null> {
        if (!this._runtime.isCreationEnabled()) {
            return null;
        }
        const task = this._provider.createTask(parentId, options);
        if (!task) {
            return null;
        }
        //the task's row shows the wait
        const isCreated = await this._runtime.execute(async () => {
            await this._provider.whenTaskCreated(task.getRecordId());
            return true;
        }, { loading: { show: false }, error: { title: this._runtime.getLabels(TASK_GRID_LABELS).get('taskGrid.createTaskFailed'), rethrow: false } });
        if (!isCreated) {
            return null;
        }
        //edits wait for the task, so the server's required values are there to save with
        this._runtime.services.find('taskTree')?.focusNewTask(task.getRecordId());
        return task;
    }

    public async open(taskIds: string[]): Promise<IOpenTasksResult | null> {
        return this._execute(() => this._provider.openTasks(taskIds), 'taskGrid.openingTasks', 'taskGrid.openTasksFailed');
    }

    public async delete(taskIds: string[]): Promise<void> {
        if (!this._runtime.isDeletionEnabled()) {
            return;
        }
        const navigation = this._runtime.services.get('pcfContext').navigation;
        const labels = this._runtime.getLabels(TASK_GRID_LABELS);
        const provider = this._provider;
        const { deletableTaskIds, refusedTaskIds } = provider.getDeletion(taskIds);
        if (deletableTaskIds.length === 0) {
            await navigation.openErrorDialog({ message: labels.get('taskGrid.tasksCannotBeDeleted') });
            return;
        }
        const subtaskCount = deletableTaskIds.filter(taskId => !taskIds.includes(taskId)).length;
        const text = subtaskCount > 0 ? labels.get('taskGrid.confirmDeleteTasksWithSubtasks', { count: subtaskCount }) : labels.get('taskGrid.confirmDeleteTasks');
        const confirmation = await navigation.openConfirmDialog({ text });
        if (!confirmation.confirmed) {
            return;
        }
        const result = await this._execute(() => provider.deleteTasks(taskIds), 'taskGrid.deletingTasks', 'taskGrid.deleteTasksFailed');
        const failures = [
            ...(result?.success === false ? result.errors : []),
            ...refusedTaskIds.map(id => ({ id, error: labels.get('taskGrid.taskCannotBeDeleted') })),
        ];
        if (failures.length > 0) {
            const subject = this._runtime.getFieldMapping().subject;
            const message = failures.map(failure => `${provider.getRecordsMap()[failure.id]?.getValue(subject) ?? failure.id}: ${ErrorHelper.getMessageFromError(failure.error)}`).join('\n');
            await navigation.openErrorDialog({ message: labels.get('taskGrid.deleteTasksFailed'), details: message });
        }
    }

    public async move(taskId: string, targetTaskId: string, position: ITaskMovePosition): Promise<true | null> {
        return this._execute(async () => {
            const task = this._provider.moveTask(taskId, targetTaskId, position);
            if (!task) {
                return null;
            }
            const result = await task.save();
            if (!result.success) {
                throw new Error(result.errors?.map(error => error.message).join('\n'));
            }
            return true;
        }, 'taskGrid.movingTask', 'taskGrid.moveTaskFailed');
    }

    public async openRecord(reference: ComponentFramework.EntityReference, columnName?: string): Promise<void> {
        if (!columnName || columnName === this._provider.getFieldMapping().subject) {
            await this.open([reference.id.guid]);
        }
        else {
            await this.openRelatedRecord(reference, columnName);
        }
    }

    public async openRelatedRecord(reference: ComponentFramework.EntityReference, columnName: string): Promise<void> {
        await this._execute(() => this._provider.openRelatedRecord(reference, columnName), 'taskGrid.openingRecord', 'taskGrid.openRecordFailed');
    }

    private get _provider(): ITaskDataProvider {
        return this._runtime.getProvider();
    }

    private _execute<T>(operation: () => Promise<T>, loadingLabel: TaskLoadingLabel, errorLabel: TaskErrorLabel): Promise<T> {
        const labels = this._runtime.getLabels(TASK_GRID_LABELS);
        return this._runtime.execute(operation, { loading: { message: labels.get(loadingLabel) }, error: { title: labels.get(errorLabel) } });
    }
}
