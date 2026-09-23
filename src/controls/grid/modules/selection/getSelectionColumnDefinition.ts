import { ColDef, ICellRendererParams } from "@ag-grid-community/core";
import { DataProvider, IRecord } from "@talxis/client-libraries";
import { CellEmptyRenderer } from "../../components/cells/empty-cell-renderer/CellEmptyRenderer";
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
    suppressSizeToFit: true,
    suppressMovable: true,
    valueGetter: () => null,
    valueFormatter: () => '',
    //a pinned row is no record to select
    cellRendererSelector: params => ({ component: params.node.rowPinned ? CellEmptyRenderer : onRenderCell }),
});
