/** The strings of the custom columns module. */
export interface ICustomColumnsLabels {
    addCustomColumn: string;
    editCustomColumn: string;
    deleteCustomColumn: string;
    confirmColumnDelete: string;
    /** Titles the dialog an operation on a custom column failed with. */
    customColumnsFailed: string;
    loadCustomColumnsFailed: string;
}

/** The English defaults for {@link ICustomColumnsLabels}. */
export const CUSTOM_COLUMNS_LABELS: ICustomColumnsLabels = {
    addCustomColumn: 'Add custom column',
    editCustomColumn: 'Edit custom column',
    deleteCustomColumn: 'Delete custom column',
    confirmColumnDelete: 'Do you want to delete this column and its values in every task?',
    customColumnsFailed: 'The custom column could not be changed.',
    loadCustomColumnsFailed: 'The custom column values could not be loaded.',
};
