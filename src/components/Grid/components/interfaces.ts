import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";

/** What this grid adds to what AG Grid hands a cell */
export interface IGridCellRendererParams {
    /** Whether the cell draws a control the user can type in. */
    takesInput?: boolean;
}

/** What AG Grid hands whatever renders a cell, plus the above. */
export interface IGridCellParams extends ICellRendererParams<IRecord>, IGridCellRendererParams {
    /** The record the row stands for. */
    data: IRecord;
}
