import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";

/** What AG Grid hands whatever renders a cell. */
export interface IGridCellParams extends ICellRendererParams<IRecord> {
    /** The record the row stands for. */
    data: IRecord;
}
