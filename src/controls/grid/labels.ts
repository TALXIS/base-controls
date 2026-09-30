/** Every localizable string the grid itself renders. */
export interface IGridLabels {
    noRecordsFound: string;
    valueNotEditable: string;
    recordNotEditable: string;
    columnNotEditable: string;
    recordSaveErrorTitle: string;
    recordSaveErrorDismiss: string;
}

/** The English defaults for {@link IGridLabels}. */
export const GRID_LABELS: IGridLabels = {
    noRecordsFound: 'No records found.',
    valueNotEditable: 'This value cannot be edited.',
    recordNotEditable: 'This record cannot be edited.',
    columnNotEditable: 'This column cannot be edited.',
    recordSaveErrorTitle: 'Your changes were not saved',
    recordSaveErrorDismiss: 'Dismiss',
};
