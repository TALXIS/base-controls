/** The strings the task dataset control renders beside the grid's own. */
export interface ITaskGridLabels {
    settings: string;
    showHierarchy: string;
    hideInactiveTasks: string;
    expandLevel: string;
    collapseLevel: string;
    /** Shown while new tasks the filter or quick find does not match are shown anyway. */
    newTasksShown: string;
    /** The task table has several lookups to the project's table, listed in `{{ columns }}`. */
    projectLookupAmbiguous: string;
}

/** The English defaults for {@link ITaskGridLabels}. */
export const TASK_GRID_LABELS: ITaskGridLabels = {
    settings: 'Settings',
    showHierarchy: 'Show hierarchy',
    hideInactiveTasks: 'Hide inactive tasks',
    expandLevel: 'Expand one level',
    collapseLevel: 'Collapse one level',
    newTasksShown: 'New tasks are shown regardless of the filter.',
    projectLookupAmbiguous: 'Several task columns link to the project ({{ columns }}); filter the FetchXML by one of them.',
};
