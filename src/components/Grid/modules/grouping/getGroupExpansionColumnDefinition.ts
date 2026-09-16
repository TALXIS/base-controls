import { ColDef } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { CellRenderer } from "@components/Grid/components/cells/cell-renderer/CellRenderer";

/** The key the expansion column takes. */
export const GROUP_EXPANSION_COLUMN_KEY = 'groupExpansion';

/** The column whose header opens and closes the groups a level at a time. */
export const getGroupExpansionColumnDefinition = (onRenderHeader: () => JSX.Element): ColDef<IRecord> => ({
    colId: GROUP_EXPANSION_COLUMN_KEY,
    headerName: '',
    width: 60,
    lockPinned: true,
    //locked, not just pinned: nothing may sort or reorder this out of the front
    lockPosition: 'left',
    resizable: false,
    sortable: false,
    pinned: 'left',
    suppressSizeToFit: true,
    suppressMovable: true,
    valueGetter: () => null,
    valueFormatter: () => '',
    headerComponent: onRenderHeader,
    //a cell of the grid's own rather than the dataset's
    cellRenderer: CellRenderer,
});
