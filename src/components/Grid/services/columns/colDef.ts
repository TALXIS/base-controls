import type { IColumn } from "@talxis/client-libraries";

/** A dataset column, and what the grid works out about it that the dataset does not say. */
export interface IGridColumn extends IColumn {
    /** Whether a value is demanded before the record may be saved. */
    isRequired: boolean;
    /** Whether the values in this column may be changed at all. */
    isEditable: boolean;
}

/** What the grid keeps on a column definition that AG Grid knows nothing about. */
export interface IGridColDefPropBag {
    /** The dataset column this was built from. */
    column?: IGridColumn;
}

declare module "@ag-grid-community/core" {
    interface ColDef<TData = any, TValue = any> {
        /** Whatever the grid keeps about this column that AG Grid has no field for. */
        propBag?: IGridColDefPropBag;
    }
}
