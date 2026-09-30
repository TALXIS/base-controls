import type { IAggregateCellComponents } from "./components/aggregate-cell/components";
import type { ITotalCellComponents } from "./components/total-cell/components";

/** The replaceable parts of what the totals draw, by the piece they belong to. */
export interface IGridAggregationComponents {
    /** What a column that totals something draws in the row pinned under the rest. */
    totalCell?: ITotalCellComponents;
    /** What a column that totals something draws in a group's row. */
    aggregateCell?: IAggregateCellComponents;
}
