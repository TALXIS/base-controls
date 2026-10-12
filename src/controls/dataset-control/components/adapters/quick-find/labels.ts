export interface IQuickFindLabels {
    /** `collection` is the provider's plural entity name, or `defaultCollectionName` when it has none. */
    searchPlaceholder: string;
    defaultCollectionName: string;
    /** Shown in the callout when the query starts with `*`. */
    leadingWildcardWarning: string;
    /** The callout's sentence above the columns: start, the bold operator, then end. */
    columnsHintStart: string;
    columnsHintOperator: string;
    columnsHintEnd: string;
}

/** The English defaults for {@link IQuickFindLabels}. */
export const QUICK_FIND_LABELS: IQuickFindLabels = {
    searchPlaceholder: 'Search {{ collection }}...',
    defaultCollectionName: 'records',
    leadingWildcardWarning: "For faster results, don't start with an asterisk (*)",
    columnsHintStart: 'Apply',
    columnsHintOperator: 'begins with',
    columnsHintEnd: 'filter on these columns:',
};
