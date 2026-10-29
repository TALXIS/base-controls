/** Every localizable string this module renders. */
export interface IGridFilteringLabels {
    filterMenuFilterBy: string;
    /** The filter panel's button that applies the filter. */
    apply: string;
    /** Clears the column's filter, in its menu and its filter panel. */
    clear: string;
    /** What this module's section of a column's menu is called. */
    menuSection: string;
}

/** The English defaults for {@link IGridFilteringLabels}. */
export const GRID_FILTERING_LABELS: IGridFilteringLabels = {
    filterMenuFilterBy: 'Filter By',
    apply: 'Apply',
    clear: 'Clear',
    menuSection: 'Filtering',
};
