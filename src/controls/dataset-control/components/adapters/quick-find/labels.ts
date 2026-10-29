import { defineLabels } from "@utils";

/** The strings of the quick find. */
export const QUICK_FIND_LABELS = defineLabels({
    /** `collection` is the provider's plural entity name, or `defaultCollectionName` when it has none. */
    'quickFind.searchPlaceholder': 'Search {{ collection }}...',
    /** Stands in for the collection name when the provider has none. */
    'quickFind.defaultCollectionName': 'records',
    /** Shown in the callout when the query starts with `*`. */
    'quickFind.leadingWildcardWarning': "For faster results, don't start with an asterisk (*)",
    /** The callout's sentence above the columns: start, the bold operator, then end. */
    'quickFind.columnsHintStart': 'Apply',
    /** The bold operator between the columns. */
    'quickFind.columnsHintOperator': 'begins with',
    /** The end of the sentence, after the columns. */
    'quickFind.columnsHintEnd': 'filter on these columns:',
});
