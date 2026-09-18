import { CellRendererSelectorResult, ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";

/** A `cellRendererSelector` that renders nothing in a pinned row. */
export const suppressRendererInPinnedRows = (params: ICellRendererParams<IRecord>): CellRendererSelectorResult | undefined => {
    return params.node.rowPinned ? {} : undefined;
};
