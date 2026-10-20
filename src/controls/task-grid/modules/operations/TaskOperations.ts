import type { ColDef } from "ag-grid-community";
import type { IRecord } from "@talxis/client-libraries";
import type { GridLockHook } from "@controls/grid";
import type { IRibbonCommand } from "@controls/ribbon";
import { ILocalizationService, LocalizationService } from "@utils";
import { ErrorHelper } from "@utils/error-handling";
import type { ICreateTaskOptions } from "../../provider";
import type { ITaskDatasetControlRuntime } from "../../runtime";
import { ADD_TASK_COLUMN_KEY } from "../../tree/constants";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { AddTaskCell } from "./components";
import { ITaskOperationsLabels, TASK_OPERATIONS_LABELS } from "./labels";

export interface ITaskOperationsParameters {
    /** The New command and the add-subtask buttons. */
    enableCreation?: boolean;
    /** The Edit command, and editing tasks in the grid and in their forms. */
    enableEditing?: boolean;
    /** The Delete command. */
    enableDeletion?: boolean;
    /** Overrides for the module's strings. */
    labels?: Partial<ITaskOperationsLabels>;
}

/** Which of creating, editing and deleting tasks a mount allows. */
export interface ITaskOperations {
    isCreationEnabled(): boolean;
    isEditingEnabled(): boolean;
    isDeletionEnabled(): boolean;
    getLabels(): ILocalizationService<ITaskOperationsLabels>;
    /** Creates a task, opens its parent, and starts editing its name when the grid edits. */
    createTask(parentId?: string, options?: ICreateTaskOptions): Promise<void>;
    /** Deletes the tasks and everything under them, once the user confirms. */
    deleteTasks(taskIds: string[]): Promise<void>;
    /** Takes back what the module registered; the module calls it as the mount goes. */
    destroy(): void;
}

export class TaskOperations implements ITaskOperations {
    private _taskDatasetControl: ITaskDatasetControlRuntime;
    private _parameters: ITaskOperationsParameters;
    private _labels: ILocalizationService<ITaskOperationsLabels>;
    private _unregisterCommands?: () => void;

    constructor(taskDatasetControl: ITaskDatasetControlRuntime, parameters: ITaskOperationsParameters) {
        this._taskDatasetControl = taskDatasetControl;
        this._parameters = parameters;
        this._labels = new LocalizationService<ITaskOperationsLabels>({ ...TASK_OPERATIONS_LABELS, ...parameters.labels });
        const parts = taskDatasetControl.services.get('datasetControl').parts;
        parts.whenAvailable('ribbon', ribbon => this._unregisterCommands = ribbon.registerCommands(this._onAddCommands));
        //after the tree, which adds the column the add-task buttons go in
        parts.whenAvailable('grid', grid => {
            grid.services.get('columns').registerColumnDefinitions(this._onColumnDefinitions, TASK_GRID_PRIORITY.tree + 10);
            grid.services.whenAvailable('editing', editing => editing.locks.registerLock(this._onLock, TASK_GRID_PRIORITY.tree + 10));
        });
    }

    public isCreationEnabled(): boolean {
        return !!this._parameters.enableCreation;
    }

    public isEditingEnabled(): boolean {
        return !!this._parameters.enableEditing;
    }

    public isDeletionEnabled(): boolean {
        return !!this._parameters.enableDeletion;
    }

    public destroy(): void {
        this._unregisterCommands?.();
    }

    public getLabels(): ILocalizationService<ITaskOperationsLabels> {
        return this._labels;
    }

    public async createTask(parentId?: string, options?: ICreateTaskOptions): Promise<void> {
        if (this.isCreationEnabled()) {
            await this._taskDatasetControl.execute(() => this._taskDatasetControl.getProvider().createTask(parentId, options));
        }
    }

    public async deleteTasks(taskIds: string[]): Promise<void> {
        if (!this.isDeletionEnabled()) {
            return;
        }
        const taskDatasetControl = this._taskDatasetControl;
        const navigation = taskDatasetControl.services.get('pcfContext').navigation;
        const labels = this._labels;
        const provider = taskDatasetControl.getProvider();
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
        await taskDatasetControl.execute(async () => {
            const result = await provider.deleteTasks(taskIds);
            const failures = [
                ...(result?.success === false ? result.errors : []),
                ...refusedTaskIds.map(id => ({ id, error: labels.getLocalizedString('taskCannotBeDeleted') })),
            ];
            if (failures.length > 0) {
                const subject = taskDatasetControl.getFieldMapping().subject;
                const message = failures.map(failure => `${provider.getRecordsMap()[failure.id]?.getValue(subject) ?? failure.id}: ${ErrorHelper.getMessageFromError(failure.error)}`).join('\n');
                await navigation.openErrorDialog({ message: labels.getLocalizedString('deleteTasksFailed'), details: message });
            }
        });
    }

    private _onLock: GridLockHook = (result, context) => {
        if (context.record && !context.columnName && !this.isEditingEnabled()) {
            result.isLocked = true;
        }
    };

    private _onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
        const addTaskColDef = columnDefs.find(colDef => colDef.colId === ADD_TASK_COLUMN_KEY);
        if (addTaskColDef && this.isCreationEnabled()) {
            addTaskColDef.cellRenderer = AddTaskCell;
        }
    };

    //ahead of the consumer's own commands
    private _onAddCommands = (commands: IRibbonCommand[]): void => {
        const taskDatasetControl = this._taskDatasetControl;
        const labels = this._labels;
        const selectedIds = taskDatasetControl.getProvider().getSelectedRecordIds();
        const operationCommands: IRibbonCommand[] = [];
        if (this.isCreationEnabled()) {
            operationCommands.push({ id: 'new', label: labels.getLocalizedString('new'), iconName: 'Add', onExecute: () => this.createTask() });
        }
        if (this.isEditingEnabled() && selectedIds.length > 0) {
            operationCommands.push({ id: 'edit', label: labels.getLocalizedString('edit'), iconName: 'Edit', onExecute: () => taskDatasetControl.openTasks(selectedIds) });
        }
        if (this.isDeletionEnabled() && selectedIds.length > 0) {
            operationCommands.push({ id: 'delete', label: labels.getLocalizedString('delete'), iconName: 'Delete', onExecute: () => this.deleteTasks(selectedIds) });
        }
        commands.unshift(...operationCommands);
    };
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** Which of creating, editing and deleting tasks a mount allows. */
        operations: ITaskOperations;
    }
}
