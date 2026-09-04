/** Every localizable string the grid itself renders. Override any subset through `IGrid.labels`. */
export interface IGridLabels {
    noRecordsFound: string;
    valueNotEditable: string;
}

/** The English defaults for {@link IGridLabels}. */
export const GRID_LABELS: IGridLabels = {
    noRecordsFound: 'No records found.',
    valueNotEditable: 'This value cannot be edited.',
};
