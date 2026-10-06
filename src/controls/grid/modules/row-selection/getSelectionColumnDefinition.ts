import { ColDef } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { SELECTION_COLUMN_KEY } from "./constants";
import { SelectionCell } from "./components/selection-cell/SelectionCell";
import { SelectionHeader } from "./components/selection-header/SelectionHeader";

/** The column the checkboxes live in. */
export const getSelectionColumnDefinition = (): ColDef<IRecord> => ({
    colId: SELECTION_COLUMN_KEY,
    headerName: '',
    width: 40,
    lockPinned: true,
    //locked so a module reordering the definitions cannot move it
    lockPosition: 'left',
    resizable: false,
    pinned: 'left',
    headerComponent: SelectionHeader,
    suppressSizeToFit: true,
    suppressMovable: true,
    valueGetter: () => null,
    valueFormatter: () => '',
    cellRenderer: SelectionCell,
});
