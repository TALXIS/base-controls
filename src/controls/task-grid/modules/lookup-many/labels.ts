/** The strings of the lookup-many module. */
export interface ILookupManyLabels {
    noRecordsFound: string;
    loading: string;
    loadLookupManyFailed: string;
    filterApply: string;
    /** The text a text operator compares the records' names with. */
    filterText: string;
    operatorEqual: string;
    operatorDoesNotEqual: string;
    operatorContainValues: string;
    operatorDoesNotContainValues: string;
    operatorContainsData: string;
    operatorDoesNotContainData: string;
    operatorLike: string;
    operatorNotLike: string;
    operatorBeginsWith: string;
    operatorDoesNotBeginWith: string;
    operatorEndsWith: string;
    operatorDoesNotEndWith: string;
}

/** The English defaults for {@link ILookupManyLabels}. */
export const LOOKUP_MANY_LABELS: ILookupManyLabels = {
    noRecordsFound: 'No records found.',
    loading: 'Loading...',
    loadLookupManyFailed: 'The related records could not be loaded.',
    filterApply: 'Apply',
    filterText: 'Name',
    operatorEqual: 'Equals',
    operatorDoesNotEqual: 'Does not equal',
    operatorContainValues: 'Contain values',
    operatorDoesNotContainValues: 'Does not contain values',
    operatorContainsData: 'Contains data',
    operatorDoesNotContainData: 'Does not contain data',
    operatorLike: 'Contains',
    operatorNotLike: 'Does not contain',
    operatorBeginsWith: 'Begins with',
    operatorDoesNotBeginWith: 'Does not begin with',
    operatorEndsWith: 'Ends with',
    operatorDoesNotEndWith: 'Does not end with',
};
