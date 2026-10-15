import { IGridLabels } from "@controls/grid";

/** Every string the task grid renders, the grid's own included. */
export interface ITaskGridLabels extends IGridLabels {
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
}

/** The English defaults for {@link ITaskGridLabels}, without the grid's own. */
export const TASK_GRID_LABELS: Omit<ITaskGridLabels, keyof IGridLabels> = {
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
};
