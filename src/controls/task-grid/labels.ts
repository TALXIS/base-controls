import { defineLabels } from "@utils";

/** The strings the task dataset control renders beside the grid's own. */
export const TASK_GRID_LABELS = defineLabels({
    'taskGrid.settings': 'Settings',
    'taskGrid.showHierarchy': 'Show hierarchy',
    'taskGrid.hideInactiveTasks': 'Hide inactive tasks',
    'taskGrid.expandLevel': 'Expand one level',
    'taskGrid.collapseLevel': 'Collapse one level',
    /** The task table has several lookups to the project's table, listed in `{{ columns }}`. */
    'taskGrid.projectLookupAmbiguous': 'Several task columns link to the project ({{ columns }}); filter the FetchXML by one of them.',
    /** The virtual column listing a task's ancestors. */
    'taskGrid.path': 'Path',
    'taskGrid.new': 'New',
    'taskGrid.edit': 'Edit',
    'taskGrid.delete': 'Delete',
    'taskGrid.addChild': 'Add a subtask',
    'taskGrid.confirmDeleteTasks': 'Do you want to delete the selected tasks?',
    /** Asks before deleting tasks that have `{{ count }}` subtasks under them. */
    'taskGrid.confirmDeleteTasksWithSubtasks': 'Do you want to delete the selected tasks and their {{ count }} subtasks?',
    /** None of the selected tasks may be deleted. */
    'taskGrid.tasksCannotBeDeleted': 'The selected tasks cannot be deleted.',
    /** Why the store kept a task. */
    'taskGrid.taskCannotBeDeleted': 'This task cannot be deleted.',
    /** Some tasks were not deleted; the details list them. */
    'taskGrid.deleteTasksFailed': 'Some tasks were not deleted.',
    'taskGrid.openingTasks': 'Opening tasks...',
    'taskGrid.deletingTasks': 'Deleting tasks...',
    'taskGrid.movingTask': 'Moving task...',
    'taskGrid.openingRecord': 'Opening record...',
    'taskGrid.createTaskFailed': 'The task could not be created.',
    'taskGrid.openTasksFailed': 'The tasks could not be opened.',
    'taskGrid.moveTaskFailed': 'The task could not be moved.',
    'taskGrid.openRecordFailed': 'The record could not be opened.',
    /** Titles the error dialog of an action that names none of its own. */
    'taskGrid.actionFailed': 'The action could not be completed.',
});
