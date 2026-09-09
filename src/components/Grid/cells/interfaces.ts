import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { IGridColumn } from "../grid/columns";

/** What this grid adds to what AG Grid hands a cell, and the whole of what `cellRendererParams` builds. */
export interface IGridCellRendererParams {
    baseColumn: IGridColumn;
    record: IRecord;
    /**
     * Whether the control takes input rather than only drawing the value.
     *
     * The editor definition says so outright; a renderer says so for a one-click-edit column, whose control
     * is the cell.
     */
    editing?: boolean;
}

/** What AG Grid hands whatever renders a cell, plus the above. */
export interface ICellProps extends ICellRendererParams, IGridCellRendererParams { }
