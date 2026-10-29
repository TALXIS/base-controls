import { defineLabels } from "@utils";

/** Every localizable string this module renders. */
export const GRID_AGGREGATION_LABELS = defineLabels({
    'gridAggregation.totalNone': 'None',
    'gridAggregation.totalAverage': 'Average',
    'gridAggregation.totalMaximum': 'Maximum',
    'gridAggregation.totalMinimum': 'Minimum',
    'gridAggregation.totalSum': 'Sum',
    'gridAggregation.totalCount': 'Count (including empty values)',
    'gridAggregation.totalCountColumn': 'Count',
    /** What this module's section of a column's menu is called. */
    'gridAggregation.menuSection': 'Totals',
});
