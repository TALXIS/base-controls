export interface IEditColumnsLabels {
    /** The button's text and the panel's title. */
    editColumns: string;
    save: string;
    cancel: string;
    scopeSelectorLabel: string;
    columnSelectorPlaceholder: string;
    /** The tooltip of a user-defined column in the column selector. */
    customColumnTooltip: string;
    /** Stands in for a column or scope without a name. */
    unnamed: string;
    /** Shown by a selector that finds nothing. */
    noResults: string;
}

/** The English defaults for {@link IEditColumnsLabels}. */
export const EDIT_COLUMNS_LABELS: IEditColumnsLabels = {
    editColumns: 'Edit columns',
    save: 'Save',
    cancel: 'Cancel',
    scopeSelectorLabel: 'Column source',
    columnSelectorPlaceholder: 'Add column...',
    customColumnTooltip: 'User column',
    unnamed: '(No name)',
    noResults: 'No results found.',
};
