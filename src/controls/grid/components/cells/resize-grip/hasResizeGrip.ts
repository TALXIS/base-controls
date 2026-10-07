import { ColDef } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { getColumnContext } from "../../../services/columns/colDef";

/** Whether a column's cells draw the grip a row is dragged taller by. */
export const hasResizeGrip = (colDef: ColDef<IRecord> | undefined): boolean => {
    return !!colDef?.autoHeight || !!getColumnContext(colDef).cell?.isRowResizable;
};
