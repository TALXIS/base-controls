import type { IAlignment } from "@utils";

/** What the grid's own column is, whatever its cells are bound to. */
export interface IGridColumnSettings {
    /** Which edge the value reads from. */
    alignment?: IAlignment;
    /** Whether the control takes input where the cell stands, with no editor to open. */
    oneClickEdit?: boolean;
    /** Whether what the cells hold may be changed at all. */
    isEditable?: boolean;
    /** Whether a value is demanded before the record may be saved. */
    isRequired?: boolean;
    /** Width a module added for what it draws, which a resize does not save. */
    widthOffset?: number;
}

declare module "@ag-grid-community/core" {
    interface ColDef<TData = any, TValue = any> {
        /** What the grid's cells and header read about this column. */
        settings?: IGridColumnSettings;
    }
}
