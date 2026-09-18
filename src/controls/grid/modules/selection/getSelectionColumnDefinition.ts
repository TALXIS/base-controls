import { ColDef } from "@ag-grid-community/core";
import { DataProvider, IRecord } from "@talxis/client-libraries";
import { suppressRendererInPinnedRows } from "../../services/columns";
import { IGridSelectionComponents } from "./moduleComponents";

/** The column the checkboxes live in. */
export const getSelectionColumnDefinition = (components: IGridSelectionComponents): ColDef<IRecord> => ({
    colId: DataProvider.CONST.CHECKBOX_COLUMN_KEY,
    headerName: '',
    width: 40,
    lockPinned: true,
    //locked, not just pinned: a module reordering the definitions
    lockPosition: 'left',
    resizable: false,
    pinned: 'left',
    headerComponent: components.onRenderHeader,
    cellRenderer: components.onRenderCell,
    suppressSizeToFit: true,
    suppressMovable: true,
    valueGetter: () => null,
    valueFormatter: () => '',
    cellRendererSelector: suppressRendererInPinnedRows,
});
