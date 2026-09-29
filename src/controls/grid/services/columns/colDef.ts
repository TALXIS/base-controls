import type { IRecord } from "@talxis/client-libraries";
import type { IAlignment } from "@utils";
import type { ThemeBuilder } from "@theme";
import type { IGridCellCommands, IGridCellEditable, IGridCellLoading } from "../cells";

/** What a column decides for each of its cells, before the cell hooks. */
export interface IGridColumnCellSettings {
    /** The commands a cell offers for its record, before `registerCellCommandsHook`. */
    onGetCommands?: (record: IRecord) => Partial<IGridCellCommands>;
    /** Changes a cell's theme, before `registerCellThemeHook`. */
    onGetTheme?: (theme: ThemeBuilder, params: { record: IRecord }) => void;
    /** Decides whether a cell can be edited, before `registerCellEditableHook`. */
    onGetEditable?: (result: IGridCellEditable, params: { record: IRecord }) => void;
    /** Decides whether a cell shows it is loading, before `registerCellLoadingHook`. */
    onGetLoading?: (result: IGridCellLoading, params: { record: IRecord }) => void;
}

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
    /** Per-record callbacks for each of the column's cells. */
    cell?: IGridColumnCellSettings;
}

declare module "@ag-grid-community/core" {
    interface ColDef<TData = any, TValue = any> {
        /** What the grid's cells and header read about this column. */
        settings?: IGridColumnSettings;
    }
}
