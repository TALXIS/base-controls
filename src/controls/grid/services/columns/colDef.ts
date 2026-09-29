import type { IRecord } from "@talxis/client-libraries";
import type { IAlignment } from "@utils";
import type { IGridCellCommands } from "../cells";

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
    /** Unsaved width a module adds for what it draws. */
    widthOffset?: number;
    /** The commands this column's cells offer for a record, before `registerCellCommandsHook`. */
    onGetCommands?: (record: IRecord) => Partial<IGridCellCommands>;
}

declare module "@ag-grid-community/core" {
    interface ColDef<TData = any, TValue = any> {
        /** What the grid's cells and header read about this column. */
        settings?: IGridColumnSettings;
    }
}
