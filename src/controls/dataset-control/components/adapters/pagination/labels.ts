export interface IPaginationLabels {
    firstPageTooltip: string;
    previousPageTooltip: string;
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
