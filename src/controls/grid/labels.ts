/** Every localizable string the grid itself renders. */
export interface IGridLabels {
    noRecordsFound: string;
    valueLocked: string;
    recordLocked: string;
    columnLocked: string;
    recordSaveErrorTitle: string;
    recordSaveErrorDismiss: string;
}

/** The English defaults for {@link IGridLabels}. */
export const GRID_LABELS: IGridLabels = {
    noRecordsFound: 'No records found.',
    valueLocked: 'This value cannot be edited.',
    recordLocked: 'This record cannot be edited.',
    columnLocked: 'This column cannot be edited.',
    recordSaveErrorTitle: 'Your changes were not saved',
    recordSaveErrorDismiss: 'Dismiss',
};
