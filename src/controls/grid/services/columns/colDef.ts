import type { ColDef } from "@ag-grid-community/core";
import type { IFieldValidationResult, IRecord } from "@talxis/client-libraries";
import type { IAlignment } from "@utils";
import type { ThemeBuilder } from "@theme";
import type { IContextualMenuItem } from "@fluentui/react";
import type { IParameters } from "@interfaces";
import type { IGridCellCommands, IGridCellLoading } from "../cells";
import type { IColumnHeaderAdornment, IColumnMenuSection } from "../column-header";

/** What a column decides for each of its cells, after the cell hooks. */
export interface IGridColumnCellSettings {
    /** Whether the grip a row is dragged taller by is drawn in this column's cells. */
    isRowResizable?: boolean;
    /** Changes the commands a cell offers, after `registerCellCommands`. */
    onGetCommands?: (result: IGridCellCommands, params: { record: IRecord }) => void;
    /** Changes a cell's theme, after `registerCellTheme`. */
    onGetTheme?: (theme: ThemeBuilder, params: { record: IRecord }) => void;
    /** Decides whether a cell shows it is loading, after `registerCellLoading`. */
    onGetLoading?: (result: IGridCellLoading, params: { record: IRecord }) => void;
    /** Decides whether a record's value is valid, after `registerValidation`. */
    onGetValidation?: (result: IFieldValidationResult, params: { record: IRecord }) => void;
    /** Changes the parameters a cell's control is handed, after `registerControlParameters`. */
    onGetControlParameters?: (parameters: IParameters, params: { record: IRecord }) => void;
}

/** What a column decides for its header, after the header hooks. */
export interface IGridColumnHeaderSettings {
    /** Changes the header's theme, after `registerColumnHeaderTheme`. */
    onGetTheme?: (theme: ThemeBuilder) => void;
    /** Adds what the header draws beside its name, after `registerColumnHeaderAdornments`. */
    onGetAdornments?: (adornments: IColumnHeaderAdornment[]) => void;
    /** Adds sections to the column's menu, after `registerColumnMenuSection`. */
    onGetMenuSections?: (sections: IColumnMenuSection[]) => void;
    /** Changes the items of the column's menu, after `registerColumnMenuItems`. */
    onGetMenuItems?: (items: IContextualMenuItem[]) => void;
}

/** What the grid's own column is, whatever its cells are bound to. */
export interface IGridColumnSettings {
    /** Which edge the value reads from. */
    alignment?: IAlignment;
    /** Whether the column's value stands for the record, drawn as a link to it. */
    isPrimary?: boolean;
    /** Whether a value is demanded before the record may be saved. */
    isRequired?: boolean;
    /** Unsaved width a module adds for what it draws. */
    widthOffset?: number;
    /** How each of the column's cells behaves. */
    cell?: IGridColumnCellSettings;
    /** Callbacks for the column's header. */
    header?: IGridColumnHeaderSettings;
}

/** A column of the grid: AG Grid's definition, with the grid's own `settings`. */
export type IGridColDef = ColDef<IRecord>;

/** A change to a column: its new values, or a function of the column as the grid and modules built it. */
export type IGridColDefOverride = Partial<IGridColDef> | ((colDef: IGridColDef) => Partial<IGridColDef>);

declare module "@ag-grid-community/core" {
    interface ColDef<TData = any, TValue = any> {
        /** What the grid's cells and header read about this column. */
        settings?: IGridColumnSettings;
    }
}
