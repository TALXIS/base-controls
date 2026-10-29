import { translateLabels } from "@utils";
import { GRID_AGGREGATION_LABELS } from "./labels";

export const GRID_AGGREGATION_LABELS_CS = translateLabels(GRID_AGGREGATION_LABELS, {
    'gridAggregation.totalNone': 'Žádný',
    'gridAggregation.totalAverage': 'Průměr',
    'gridAggregation.totalMaximum': 'Maximum',
    'gridAggregation.totalMinimum': 'Minimum',
    'gridAggregation.totalSum': 'Součet',
    'gridAggregation.totalCount': 'Počet (včetně prázdných hodnot)',
    'gridAggregation.totalCountColumn': 'Počet',
    'gridAggregation.menuSection': 'Součty',
});
