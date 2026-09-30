import { ColDef } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";

/** Whether a column's cells draw the grip a row is dragged taller by. */
export const hasResizeGrip = (colDef: ColDef<IRecord> | undefined): boolean => {
    return !!colDef?.autoHeight || !!colDef?.settings?.cell?.isRowResizable;
};
