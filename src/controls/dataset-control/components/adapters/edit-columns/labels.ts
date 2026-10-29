import { defineLabels } from "@utils";

/** The strings of the column editor. */
export const EDIT_COLUMNS_LABELS = defineLabels({
    /** The button's text and the panel's title. */
    'editColumns.editColumns': 'Edit columns',
    /** The panel's save button. */
    'editColumns.save': 'Save',
    /** The panel's cancel button. */
    'editColumns.cancel': 'Cancel',
    /** The label of the entity picker. */
    'editColumns.scopeSelectorLabel': 'Column source',
    /** The placeholder of the column picker. */
    'editColumns.columnSelectorPlaceholder': 'Add column...',
    /** The tooltip of a user-defined column in the column selector. */
    'editColumns.customColumnTooltip': 'User column',
    /** Stands in for a column or scope without a name. */
    'editColumns.unnamed': '(No name)',
    /** Shown by a selector that finds nothing. */
    'editColumns.noResults': 'No results found.',
    /** Shown by a selector while its options load. */
    'editColumns.loading': 'Loading...',
});
