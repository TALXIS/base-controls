import { CellRendererSelectorResult, ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";

/**
 * A `cellRendererSelector` that renders nothing in a pinned row, which is never a record of the dataset.
 * AG Grid has no option for this: a result carrying no `component` leaves it nothing to build, while
 * `undefined` falls back to the column's own `cellRenderer`.
 */
export const suppressRendererInPinnedRows = (params: ICellRendererParams<IRecord>): CellRendererSelectorResult | undefined => {
    return params.node.rowPinned ? {} : undefined;
};
