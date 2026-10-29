import { defineLabels } from "@utils";

/** The strings of the user queries. */
export const USER_QUERIES_LABELS = defineLabels({
    /** The header the user's views are listed under. */
    'userQueries.myViewsHeader': 'My views',
    'userQueries.saveChanges': 'Save changes',
    'userQueries.saveAsNewView': 'Save as new view',
    'userQueries.manageViews': 'Manage views',
    /** The prompt for a new view's name. */
    'userQueries.viewName': 'Name',
    'userQueries.save': 'Save',
    'userQueries.delete': 'Delete',
    'userQueries.confirmDeleteViews': 'Do you want to delete the selected views?',
    'userQueries.close': 'Close',
    /** Shown when a save fails without saying why. */
    'userQueries.saveFailed': 'The view could not be saved.',
    /** Shown when a delete fails without saying why. */
    'userQueries.deleteFailed': 'The view could not be deleted.',
});
