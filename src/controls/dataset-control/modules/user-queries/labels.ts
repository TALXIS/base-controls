/** The strings of the user queries, set on `createUserQueriesModule`. */
export interface IUserQueriesLabels {
    /** The header the user's views are listed under. */
    myViewsHeader: string;
    saveChanges: string;
    saveAsNewView: string;
    manageViews: string;
    /** The prompt for a new view's name. */
    viewName: string;
    save: string;
    delete: string;
    confirmDeleteViews: string;
    close: string;
    /** Shown when a save fails without saying why. */
    saveFailed: string;
    /** Shown when a delete fails without saying why. */
    deleteFailed: string;
}

/** The English defaults for {@link IUserQueriesLabels}. */
export const USER_QUERIES_LABELS: IUserQueriesLabels = {
    myViewsHeader: 'My views',
    saveChanges: 'Save changes',
    saveAsNewView: 'Save as new view',
    manageViews: 'Manage views',
    viewName: 'Name',
    save: 'Save',
    delete: 'Delete',
    confirmDeleteViews: 'Do you want to delete the selected views?',
    close: 'Close',
    saveFailed: 'The view could not be saved.',
    deleteFailed: 'The view could not be deleted.',
};
