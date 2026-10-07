import type { ColDef } from "ag-grid-community";
import type { IFieldValidationResult, IRecord } from "@talxis/client-libraries";
import type { IAlignment } from "@utils";
import type { ThemeBuilder } from "@theme";
import type { IContextualMenuItem } from "@fluentui/react";
import type { IParameters } from "@interfaces";
import type { IGridCellCommands, IGridCellLoading } from "../cells";
import type { IColumnHeaderAdornment, IColumnMenuSection } from "../column-header";

/** What a column decides for each of its cells, after the cell hooks. */
export interface IGridColumnCellContext {
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
export interface IGridColumnHeaderContext {
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
export interface IGridColumnContext {
    /** Which edge the value reads from. */
    alignment?: IAlignment;
    /** Whether the column's value stands for the record, drawn as a link to it. */
    isPrimary?: boolean;
    /** Whether a value is demanded before the record may be saved. */
    isRequired?: boolean;
    /** Unsaved width a module adds for what it draws. */
    widthOffset?: number;
    /** How each of the column's cells behaves. */
    cell?: IGridColumnCellContext;
    /** Callbacks for the column's header. */
    header?: IGridColumnHeaderContext;
    /** Your own options for the column, read back with `getColumnContext`. */
    [key: string]: unknown;
}

/** A column of the grid: AG Grid's definition, with the grid's own `context`. */
export type IGridColDef = Omit<ColDef<IRecord>, 'context'> & {
    /** What the grid's cells and header read about this column, and your own options beside them. */
    context?: IGridColumnContext;
};

/** A change to a column: its new values, or a function of the column as built, `null` for a column it adds. */
export type IGridColDefOverride = Partial<IGridColDef> | ((colDef: IGridColDef | null) => Partial<IGridColDef>);

/** What a column definition carries in its `context`. */
export const getColumnContext = (colDef: ColDef | null | undefined): IGridColumnContext => colDef?.context ?? {};
