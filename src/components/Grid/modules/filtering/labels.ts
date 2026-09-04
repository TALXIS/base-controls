/** Every localizable string this module renders. Override any subset through its `labels` option. */
export interface IGridFilteringLabels {
    filterMenuFilterBy: string;
    /** The entry that clears the column's filter. */
    clear: string;
    /** What this module's section of a column's menu is called. */
    menuSection: string;
}

/** The English defaults for {@link IGridFilteringLabels}. */
export const GRID_FILTERING_LABELS: IGridFilteringLabels = {
    filterMenuFilterBy: 'Filter By',
    clear: 'Clear',
    menuSection: 'Filtering',
};
