/** The strings of the pagination. */
export interface IPaginationLabels {
    /** The first page button's tooltip. */
    firstPageTooltip: string;
    /** The previous page button's tooltip. */
    previousPageTooltip: string;
    /** The next page button's tooltip. */
    nextPageTooltip: string;
    /** `number` is the current page's number. */
    currentPage: string;
}

/** The English defaults for {@link IPaginationLabels}. */
export const PAGINATION_LABELS: IPaginationLabels = {
    firstPageTooltip: 'First page',
    previousPageTooltip: 'Previous',
    nextPageTooltip: 'Next',
    currentPage: 'Page {{ number }}',
};
