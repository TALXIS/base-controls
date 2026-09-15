import type { IColumn } from "@talxis/client-libraries";

/** A dataset column, and what the grid works out about it that the dataset does not say. */
export interface IGridColumn extends IColumn {
    /** Whether a value is demanded before the record may be saved. */
    isRequired: boolean;
    /**
     * Whether the values in this column may be changed at all.
     *
     * Not the same question as `editable`, which is AG Grid's and asks whether there is an editor to
     * open: a one-click-edit column has no editor and changes its value all the same.
     */
    isEditable: boolean;
}

/** What the grid keeps on a column definition that AG Grid knows nothing about. */
export interface IGridColDefPropBag {
    /**
     * The dataset column this was built from.
     *
     * Absent on a column of the grid's own - the checkboxes, the column a save is reported in, one a
     * module added - which have nothing of the dataset behind them.
     */
    column?: IGridColumn;
}

declare module "@ag-grid-community/core" {
    interface ColDef<TData = any, TValue = any> {
        /**
         * Whatever the grid keeps about this column that AG Grid has no field for.
         *
         * AG Grid merges a definition into the one it keeps rather than reading its keys, so what is put
         * here survives to `column.getColDef()` and to every `params.colDef` a cell is handed. A plain
         * object is deep-copied on the way through, so this is for data rather than for identity.
         */
        propBag?: IGridColDefPropBag;
    }
}
