/** The strings the task dataset control renders beside the grid's own. */
export interface ITaskGridLabels {
    settings: string;
    showHierarchy: string;
    hideInactiveTasks: string;
    expandLevel: string;
    collapseLevel: string;
    /** The task table has several lookups to the project's table, listed in `{{ columns }}`. */
    projectLookupAmbiguous: string;
    /** The virtual column listing a task's ancestors. */
    path: string;
    new: string;
    edit: string;
    delete: string;
    addChild: string;
    confirmDeleteTasks: string;
    /** Asks before deleting tasks that have `{{ count }}` subtasks under them. */
    confirmDeleteTasksWithSubtasks: string;
    /** None of the selected tasks may be deleted. */
    tasksCannotBeDeleted: string;
    /** Why the store kept a task. */
    taskCannotBeDeleted: string;
    /** Some tasks were not deleted; the details list them. */
    deleteTasksFailed: string;
    creatingTask: string;
    editingTasks: string;
    deletingTasks: string;
    movingTask: string;
    openingRecord: string;
    createTaskFailed: string;
    editTasksFailed: string;
    moveTaskFailed: string;
    openRecordFailed: string;
    /** Titles the error dialog of an action that names none of its own. */
    actionFailed: string;
}

/** The English defaults for {@link ITaskGridLabels}. */
export const TASK_GRID_LABELS: ITaskGridLabels = {
    settings: 'Settings',
    showHierarchy: 'Show hierarchy',
    hideInactiveTasks: 'Hide inactive tasks',
    expandLevel: 'Expand one level',
    collapseLevel: 'Collapse one level',
    projectLookupAmbiguous: 'Several task columns link to the project ({{ columns }}); filter the FetchXML by one of them.',
    path: 'Path',
    new: 'New',
    edit: 'Edit',
    delete: 'Delete',
    addChild: 'Add a subtask',
    confirmDeleteTasks: 'Do you want to delete the selected tasks?',
    confirmDeleteTasksWithSubtasks: 'Do you want to delete the selected tasks and their {{ count }} subtasks?',
    tasksCannotBeDeleted: 'The selected tasks cannot be deleted.',
    taskCannotBeDeleted: 'This task cannot be deleted.',
    deleteTasksFailed: 'Some tasks were not deleted.',
    creatingTask: 'Creating task...',
    editingTasks: 'Opening tasks...',
    deletingTasks: 'Deleting tasks...',
    movingTask: 'Moving task...',
    openingRecord: 'Opening record...',
    createTaskFailed: 'The task could not be created.',
    editTasksFailed: 'The tasks could not be opened.',
    moveTaskFailed: 'The task could not be moved.',
    openRecordFailed: 'The record could not be opened.',
    actionFailed: 'The action could not be completed.',
};
