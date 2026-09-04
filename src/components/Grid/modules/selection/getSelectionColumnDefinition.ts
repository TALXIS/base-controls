import { ColDef } from "@ag-grid-community/core";
import { DataProvider, IRecord } from "@talxis/client-libraries";
import { suppressRendererInPinnedRows } from "../../grid/columns";
import { IGridSelectionComponents } from "./moduleComponents";

/**
 * The column the checkboxes live in.
 *
 * Pinned and unmovable: it is what a row is selected by, so it stays where the eye starts. It carries no
 * value of its own, which is why the getter and the formatter answer nothing.
 */
export const getSelectionColumnDefinition = (components: IGridSelectionComponents): ColDef<IRecord> => ({
    colId: DataProvider.CONST.CHECKBOX_COLUMN_KEY,
    headerName: '',
    width: 40,
    lockPinned: true,
    //locked, not just pinned: a module reordering the definitions - grouping puts its own columns first -
    //would otherwise push the checkboxes out of the leading position a row is selected from
    lockPosition: 'left',
    resizable: false,
    pinned: 'left',
    headerComponent: components.onRenderHeader,
    cellRenderer: components.onRenderCell,
    suppressSizeToFit: true,
    suppressMovable: true,
    valueGetter: () => null,
    valueFormatter: () => '',
    cellRendererParams: (params: any) => ({ record: params.data }),
    cellRendererSelector: suppressRendererInPinnedRows,
});
