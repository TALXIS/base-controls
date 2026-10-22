/** The strings of the IndexedDB custom column form. */
export interface IIndexedDbCustomColumnFormLabels {
    newColumnTitle: string;
    editColumnTitle: string;
    columnName: string;
    columnType: string;
    isRequired: string;
    precision: string;
    /** Above the options of a choice column, one per line. */
    options: string;
    typeText: string;
    typeMultilineText: string;
    typeWholeNumber: string;
    typeDecimal: string;
    typeCurrency: string;
    typeDate: string;
    typeDateAndTime: string;
    typeYesNo: string;
    typeChoice: string;
    no: string;
    yes: string;
}

/** The English defaults for {@link IIndexedDbCustomColumnFormLabels}. */
export const INDEXED_DB_CUSTOM_COLUMN_FORM_LABELS: IIndexedDbCustomColumnFormLabels = {
    newColumnTitle: 'New column',
    editColumnTitle: 'Edit column',
    columnName: 'Name',
    columnType: 'Type',
    isRequired: 'Required',
    precision: 'Decimal places',
    options: 'Options, one per line',
    typeText: 'Text',
    typeMultilineText: 'Multiline text',
    typeWholeNumber: 'Whole number',
    typeDecimal: 'Decimal number',
    typeCurrency: 'Currency',
    typeDate: 'Date',
    typeDateAndTime: 'Date and time',
    typeYesNo: 'Yes/No',
    typeChoice: 'Choice',
    no: 'No',
    yes: 'Yes',
};
