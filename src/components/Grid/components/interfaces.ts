import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { IGridColumn } from "../services/columns";

/** What this grid adds to what AG Grid hands a cell, and the whole of what `cellRendererParams` builds. */
export interface IGridCellRendererParams {
    baseColumn: IGridColumn;
    record: IRecord;
    /**
     * Whether the control takes input rather than only drawing the value.
     *
     * What a one-click-edit column's renderer says of itself, its control being the cell: an editor takes
     * input by being one, and says nothing.
     */
    editing?: boolean;
}

/** What AG Grid hands whatever renders a cell, plus the above. */
export interface IGridCellParams extends ICellRendererParams, IGridCellRendererParams { }
