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
    /** Shown while new tasks the filter or quick find does not match are shown anyway. */
    newTasksShown: string;
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
    confirmDeleteTasks: 'Do you want to delete the selected tasks and everything under them?',
    newTasksShown: 'New tasks are shown regardless of the filter.',
};
