import { ColDef } from "@ag-grid-community/core";
import { DataProvider, IRecord } from "@talxis/client-libraries";
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
    resizable: false,
    pinned: 'left',
    headerComponent: components.onRenderHeader,
    cellRenderer: components.onRenderCell,
    suppressSizeToFit: true,
    suppressMovable: true,
    valueGetter: () => null,
    valueFormatter: () => '',
    cellRendererParams: (params: any) => ({ record: params.data }),
});
