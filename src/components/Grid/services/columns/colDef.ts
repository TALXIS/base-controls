import type { IAlignment } from "@utils";

/** What the grid keeps on a column definition that AG Grid knows nothing about. */
export interface IGridColDefPropBag {
    /** Where the cells of this column draw their content. */
    alignment?: IAlignment;
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
