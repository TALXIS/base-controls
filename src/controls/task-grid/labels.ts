/** The strings the task dataset control renders beside the grid's own. */
export interface ITaskGridLabels {
    new: string;
    edit: string;
    delete: string;
    settings: string;
    showHierarchy: string;
    hideInactiveTasks: string;
    addChild: string;
    expandLevel: string;
    collapseLevel: string;
    confirmDeleteTasks: string;
    /** Asks before deleting tasks that have `{{ count }}` subtasks under them. */
    confirmDeleteTasksWithSubtasks: string;
    /** None of the selected tasks may be deleted. */
    tasksCannotBeDeleted: string;
    /** Why the strategy kept a task. */
    taskCannotBeDeleted: string;
    /** Some tasks were not deleted; the details list them. */
    deleteTasksFailed: string;
    /** Shown while new tasks the filter or quick find does not match are shown anyway. */
    newTasksShown: string;
    /** The task table has several lookups to the project's table, listed in `{{ columns }}`. */
    projectLookupAmbiguous: string;
}

/** The English defaults for {@link ITaskGridLabels}. */
export const TASK_GRID_LABELS: ITaskGridLabels = {
    new: 'New',
    edit: 'Edit',
    delete: 'Delete',
    settings: 'Settings',
    showHierarchy: 'Show hierarchy',
    hideInactiveTasks: 'Hide inactive tasks',
    addChild: 'Add a subtask',
    expandLevel: 'Expand one level',
    collapseLevel: 'Collapse one level',
    confirmDeleteTasks: 'Do you want to delete the selected tasks?',
    confirmDeleteTasksWithSubtasks: 'Do you want to delete the selected tasks and their {{ count }} subtasks?',
    tasksCannotBeDeleted: 'The selected tasks cannot be deleted.',
    taskCannotBeDeleted: 'This task cannot be deleted.',
    deleteTasksFailed: 'Some tasks were not deleted.',
    newTasksShown: 'New tasks are shown regardless of the filter.',
    projectLookupAmbiguous: 'Several task columns link to the project ({{ columns }}); filter the FetchXML by one of them.',
};
