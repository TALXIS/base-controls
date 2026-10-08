import { GridApi, IRowNode, RowPinnedType } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";

/** The row at an index AG Grid reports, pinned rows included. */
export const getRowNode = (gridApi: GridApi<IRecord>, rowIndex: number | null | undefined, rowPinned: RowPinnedType | undefined): IRowNode<IRecord> | undefined => {
    if (rowIndex == null) {
        return undefined;
    }
    switch (rowPinned) {
        case 'top': {
            return gridApi.getPinnedTopRow(rowIndex);
        }
        case 'bottom': {
            return gridApi.getPinnedBottomRow(rowIndex);
        }
        default: {
            return gridApi.getDisplayedRowAtIndex(rowIndex);
        }
    }
};
