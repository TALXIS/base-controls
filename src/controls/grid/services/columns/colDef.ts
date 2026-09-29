import type { IRecord } from "@talxis/client-libraries";
import type { IAlignment } from "@utils";
import type { ThemeBuilder } from "@theme";
import type { IContextualMenuItem } from "@fluentui/react";
import type { IGridCellCommands, IGridCellEditable, IGridCellLoading } from "../cells";
import type { IColumnHeaderAdornment, IColumnMenuSection } from "../column-header";

/** What a column decides for each of its cells, after the cell hooks. */
export interface IGridColumnCellSettings {
    /** Whether the control takes input where the cell stands, with no editor to open. */
    oneClickEdit?: boolean;
    /** Changes the commands a cell offers, after `registerCellCommandsHook`. */
    onGetCommands?: (result: IGridCellCommands, params: { record: IRecord }) => void;
    /** Changes a cell's theme, after `registerCellThemeHook`. */
    onGetTheme?: (theme: ThemeBuilder, params: { record: IRecord }) => void;
    /** Decides whether a cell can be edited, after `registerCellEditableHook`. */
    onGetEditable?: (result: IGridCellEditable, params: { record: IRecord }) => void;
    /** Decides whether a cell shows it is loading, after `registerCellLoadingHook`. */
    onGetLoading?: (result: IGridCellLoading, params: { record: IRecord }) => void;
}

/** What a column decides for its header, after the header hooks. */
export interface IGridColumnHeaderSettings {
    /** Changes the header's theme, after `registerColumnHeaderThemeHook`. */
    onGetTheme?: (theme: ThemeBuilder) => void;
    /** Adds what the header draws beside its name, after `registerColumnHeaderAdornmentsHook`. */
    onGetAdornments?: (adornments: IColumnHeaderAdornment[]) => void;
    /** Adds sections to the column's menu, after `registerColumnMenuSectionHook`. */
    onGetMenuSections?: (sections: IColumnMenuSection[]) => void;
    /** Changes the items of the column's menu, after `registerColumnMenuItemsHook`. */
    onGetMenuItems?: (items: IContextualMenuItem[]) => void;
}

/** What the grid's own column is, whatever its cells are bound to. */
export interface IGridColumnSettings {
    /** Which edge the value reads from. */
    alignment?: IAlignment;
    /** Whether what the cells hold may be changed at all. */
    isEditable?: boolean;
    /** Whether a value is demanded before the record may be saved. */
    isRequired?: boolean;
    /** Unsaved width a module adds for what it draws. */
    widthOffset?: number;
    /** How each of the column's cells behaves. */
    cell?: IGridColumnCellSettings;
    /** Callbacks for the column's header. */
    header?: IGridColumnHeaderSettings;
}

declare module "@ag-grid-community/core" {
    interface ColDef<TData = any, TValue = any> {
        /** What the grid's cells and header read about this column. */
        settings?: IGridColumnSettings;
    }
}
