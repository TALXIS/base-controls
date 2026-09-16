import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";

/** What this grid adds to what AG Grid hands a cell, and the whole of what `cellRendererParams` builds. */
export interface IGridCellRendererParams {
    /**
     * Whether the cell draws a control the user can type in rather than the value it holds.
     *
     * What a one-click-edit column's renderer says of itself, its control being the cell: an editor takes
     * input by being one, and says nothing.
     */
    takesInput?: boolean;
}

/** What AG Grid hands whatever renders a cell, plus the above. */
export interface IGridCellParams extends ICellRendererParams<IRecord>, IGridCellRendererParams {
    /** The record the row stands for. Narrowed from AG Grid's optional one: these cells only render on rows that have one. */
    data: IRecord;
}
