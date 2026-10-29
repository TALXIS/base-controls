import { defineLabels } from "@utils";

/** The strings of the custom columns module. */
export const CUSTOM_COLUMNS_LABELS = defineLabels({
    'customColumns.addCustomColumn': 'Add custom column',
    'customColumns.editCustomColumn': 'Edit custom column',
    'customColumns.deleteCustomColumn': 'Delete custom column',
    'customColumns.confirmColumnDelete': 'Do you want to delete this column and its values in every task?',
    /** Titles the dialog an operation on a custom column failed with. */
    'customColumns.customColumnsFailed': 'The custom column could not be changed.',
    'customColumns.loadCustomColumnsFailed': 'The custom column values could not be loaded.',
});
