import { ColDef, ICellRendererParams } from "@ag-grid-community/core";
import { DataProvider, IRecord } from "@talxis/client-libraries";
import { suppressRendererInPinnedRows } from "../../services/columns";
import { IColumnHeaderParams } from "../../components/column-header/root/ColumnHeaderRoot";

/** The column the checkboxes live in. */
export const getSelectionColumnDefinition = (
    onRenderHeader: (props: IColumnHeaderParams) => JSX.Element,
    onRenderCell: (props: ICellRendererParams<IRecord>) => JSX.Element): ColDef<IRecord> => ({
    colId: DataProvider.CONST.CHECKBOX_COLUMN_KEY,
    headerName: '',
    width: 40,
    lockPinned: true,
    //locked, not just pinned: a module reordering the definitions
    lockPosition: 'left',
    resizable: false,
    pinned: 'left',
    headerComponent: onRenderHeader,
    cellRenderer: onRenderCell,
    suppressSizeToFit: true,
    suppressMovable: true,
    valueGetter: () => null,
    valueFormatter: () => '',
    cellRendererSelector: suppressRendererInPinnedRows,
});
