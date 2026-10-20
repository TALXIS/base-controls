/** The strings of the task operations module. */
export interface ITaskOperationsLabels {
    new: string;
    edit: string;
    delete: string;
    addChild: string;
    confirmDeleteTasks: string;
    /** Asks before deleting tasks that have `{{ count }}` subtasks under them. */
    confirmDeleteTasksWithSubtasks: string;
    /** None of the selected tasks may be deleted. */
    tasksCannotBeDeleted: string;
    /** Why the strategy kept a task. */
    taskCannotBeDeleted: string;
    /** Some tasks were not deleted; the details list them. */
    deleteTasksFailed: string;
}

/** The English defaults for {@link ITaskOperationsLabels}. */
export const TASK_OPERATIONS_LABELS: ITaskOperationsLabels = {
    new: 'New',
    edit: 'Edit',
    delete: 'Delete',
    addChild: 'Add a subtask',
    confirmDeleteTasks: 'Do you want to delete the selected tasks?',
    confirmDeleteTasksWithSubtasks: 'Do you want to delete the selected tasks and their {{ count }} subtasks?',
    tasksCannotBeDeleted: 'The selected tasks cannot be deleted.',
    taskCannotBeDeleted: 'This task cannot be deleted.',
    deleteTasksFailed: 'Some tasks were not deleted.',
};
