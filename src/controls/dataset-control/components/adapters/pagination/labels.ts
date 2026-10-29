import { defineLabels } from "@utils";

/** The strings of the pagination. */
export const PAGINATION_LABELS = defineLabels({
    /** The first page button's tooltip. */
    'pagination.firstPageTooltip': 'First page',
    /** The previous page button's tooltip. */
    'pagination.previousPageTooltip': 'Previous',
    /** The next page button's tooltip. */
    'pagination.nextPageTooltip': 'Next',
    /** `number` is the current page's number. */
    'pagination.currentPage': 'Page {{ number }}',
});
