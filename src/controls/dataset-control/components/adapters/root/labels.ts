/** The strings `DatasetControl` shows itself. */
export interface IDatasetControlLabels {
    /** Asked before anything that reloads the provider throws its unsaved changes away. */
    unsavedChangesConfirmation: string;
}

/** The English defaults for {@link IDatasetControlLabels}. */
export const DATASET_CONTROL_LABELS: IDatasetControlLabels = {
    unsavedChangesConfirmation: 'This action will discard all unsaved changes. Would you like to continue?',
};
