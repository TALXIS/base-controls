/** The strings of the lookup-many module. */
export interface ILookupManyLabels {
    noRecordsFound: string;
    loading: string;
    loadLookupManyFailed: string;
}

/** The English defaults for {@link ILookupManyLabels}. */
export const LOOKUP_MANY_LABELS: ILookupManyLabels = {
    noRecordsFound: 'No records found.',
    loading: 'Loading...',
    loadLookupManyFailed: 'The related records could not be loaded.',
};
