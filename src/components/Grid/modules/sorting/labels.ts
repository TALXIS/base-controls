/** Every localizable string this module renders. Override any subset through its `labels` option. */
export interface IGridSortingLabels {
    sortTextAscending: string;
    sortTextDescending: string;
    sortDateAscending: string;
    sortDateDescending: string;
    sortNumberAscending: string;
    sortNumberDescending: string;
    sortTwoOptionsJoint: string;
    /** The entry that clears what the column is sorted by. */
    clear: string;
    /** What this module's section of a column's menu is called. */
    menuSection: string;
}

/** The English defaults for {@link IGridSortingLabels}. */
export const GRID_SORTING_LABELS: IGridSortingLabels = {
    sortTextAscending: 'Sort A to Z',
    sortTextDescending: 'Sort Z to A',
    sortDateAscending: 'Sort older to newer',
    sortDateDescending: 'Sort newer to older',
    sortNumberAscending: 'Sort smaller to larger',
    sortNumberDescending: 'Sort larger to smaller',
    sortTwoOptionsJoint: 'to',
    clear: 'Clear',
    menuSection: 'Sorting',
};
