import type { IRecord } from "@talxis/client-libraries";
import { ErrorHelper } from "@core/error-handling";
import type { INewTaskParameters, IOpenTasksResult, ITaskDataProvider, ITaskMovePosition } from "../provider";
import { LOOKUP_LABELS } from "@fields/lookup/labels";
import { TASK_GRID_LABELS } from "../../labels";
import type { ITaskRuntime } from "../interfaces";

type TaskLoadingLabel = 'taskGrid.openingTasks' | 'taskGrid.deletingTasks' | 'taskGrid.movingTask' | 'taskGrid.openingRecord';
type TaskErrorLabel = 'taskGrid.openTasksFailed' | 'taskGrid.deleteTasksFailed' | 'taskGrid.moveTaskFailed' | 'taskGrid.openRecordFailed';

/** The task actions, each run under the loading overlay and its error shown. */
export interface ITaskActions {
    /** @returns The created task, or `null` when it was not created. */
    create(parentId?: string, parameters?: INewTaskParameters): Promise<IRecord | null>;
    /** Opens the tasks in an editor outside the grid, such as a form. */
    open(taskIds: string[]): Promise<IOpenTasksResult | null>;
    /** Confirms, deletes the tasks with their subtrees, and reports any it could not delete. */
    delete(taskIds: string[]): Promise<void>;
    /** Places the task and saves it, or returns `null` when it cannot go there. */
    move(taskId: string, targetTaskId: string, position: ITaskMovePosition): Promise<true | null>;
    /** Opens the task, or the record its lookup points to when `columnName` is another column. */
    openRecord(reference: ComponentFramework.EntityReference, columnName?: string): Promise<void>;
    openRelatedRecord(reference: ComponentFramework.EntityReference, columnName: string): Promise<void>;
}

const NAMED_TASK_COUNT = 3;

/** Runs the provider's task actions under the loading overlay with their errors shown. */
export class TaskActions implements ITaskActions {
    private _runtime: ITaskRuntime;
    private _latestCreatedTaskId?: string;

    constructor(runtime: ITaskRuntime) {
        this._runtime = runtime;
    }

    public async create(parentId?: string, parameters?: INewTaskParameters): Promise<IRecord | null> {
        if (!this._runtime.isCreationEnabled()) {
            return null;
        }
        //named as Power Apps names an empty lookup, so it saves without the required name
        const { subject } = this._provider.getFieldMapping();
        const data = { [subject]: this._runtime.getLabels(LOOKUP_LABELS).get('lookup.noName'), ...parameters?.data };
        const task = this._provider.createTask(parentId, { ...parameters, data });
        if (!task) {
            return null;
        }
        const taskId = task.getRecordId();
        this._latestCreatedTaskId = taskId;
        //the task's row shows the wait
        const isCreated = await this._runtime.execute(() => this._provider.whenTaskCreated(taskId), { loading: { show: false }, error: { title: this._runtime.getLabels(TASK_GRID_LABELS).get('taskGrid.createTaskFailed'), rethrow: false } });
        if (!isCreated) {
            return null;
        }
        //a task created since takes the editor
        if (this._runtime.isEditingEnabled() && this._latestCreatedTaskId === taskId) {
            this._runtime.services.find('taskTree')?.editTaskSubject(taskId);
        }
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
        const names = this._getTaskNames(taskIds);
        const text = subtaskCount > 0 ? labels.get('taskGrid.confirmDeleteTasksWithSubtasks', { names, count: subtaskCount }) : labels.get('taskGrid.confirmDeleteTasks', { names });
        const confirmation = await navigation.openConfirmDialog({ text });
        if (!confirmation.confirmed) {
            return;
        }
        await this._execute(async () => {
            const result = await provider.deleteTasks(taskIds);
            const failures = [
                ...(result?.success === false ? result.errors : []),
                ...refusedTaskIds.map(id => ({ id, error: labels.get('taskGrid.taskCannotBeDeleted') })),
            ];
            if (failures.length > 0) {
                const subject = this._runtime.getFieldMapping().subject;
                throw new Error(failures.map(failure => `${provider.getRecordsMap()[failure.id]?.getValue(subject) ?? failure.id}: ${ErrorHelper.getMessageFromError(failure.error)}`).join('\n'));
            }
        }, 'taskGrid.deletingTasks', 'taskGrid.deleteTasksFailed');
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

    //the first few by name, the rest as a count
    private _getTaskNames(taskIds: string[]): string {
        const recordsMap = this._provider.getRecordsMap();
        const subject = this._provider.getFieldMapping().subject;
        const names = taskIds.slice(0, NAMED_TASK_COUNT).map(taskId => `"${recordsMap[taskId]?.getFormattedValue(subject) ?? ''}"`).join(', ');
        return taskIds.length > NAMED_TASK_COUNT ? `${names} +${taskIds.length - NAMED_TASK_COUNT}` : names;
    }

    private _execute<T>(operation: () => Promise<T>, loadingLabel: TaskLoadingLabel, errorLabel: TaskErrorLabel): Promise<T> {
        const labels = this._runtime.getLabels(TASK_GRID_LABELS);
        return this._runtime.execute(operation, { loading: { message: labels.get(loadingLabel) }, error: { title: labels.get(errorLabel) } });
    }
}
