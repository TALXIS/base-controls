import { AggregationUiTotalValue } from './total-value';

export * from './total-value';

/** What draws the totals, and nothing that knows which column. */
export interface IAggregationUi {
    TotalValue: typeof AggregationUiTotalValue;
}

export const AggregationUi: IAggregationUi = {
    TotalValue: AggregationUiTotalValue,
};
