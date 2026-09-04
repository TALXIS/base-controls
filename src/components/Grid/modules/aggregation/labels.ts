/** Every localizable string this module renders. Override any subset through its `labels` option. */
export interface IGridAggregationLabels {
    totalNone: string;
    totalAverage: string;
    totalMaximum: string;
    totalMinimum: string;
    totalSum: string;
    totalCount: string;
    totalCountColumn: string;
    /** What this module's section of a column's menu is called. */
    menuSection: string;
}

/** The English defaults for {@link IGridAggregationLabels}. */
export const GRID_AGGREGATION_LABELS: IGridAggregationLabels = {
    totalNone: 'None',
    totalAverage: 'Average',
    totalMaximum: 'Maximum',
    totalMinimum: 'Minimum',
    totalSum: 'Sum',
    totalCount: 'Count (including empty values)',
    totalCountColumn: 'Count',
    menuSection: 'Totals',
};
