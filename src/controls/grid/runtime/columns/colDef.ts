import type { IRecord } from "@talxis/client-libraries";
import type { ColDef } from "ag-grid-community";
import type { IAlignment } from "@core";
import type { IParameters } from "@pcf/interfaces";

/** The control a column's cells use in one mode. */
export interface IGridColumnModeControl {
    /** The PCF to use; left out, the cell keeps the one it has. */
    name?: string;
    /** Handed to the control, by parameter name. */
    parameters?: IParameters;
}

/** The controls a column's cells are drawn and edited with, before `cells.hooks.control`. */
export interface IGridColumnControlContext {
    /** Handed to the control in every cell of the column. */
    parameters?: IParameters;
    /** While a cell only shows its value. */
    renderer?: IGridColumnModeControl;
    /** While a cell is being edited. */
    editor?: IGridColumnModeControl;
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
    /** Whether the grip a row is dragged taller by is drawn in this column's cells. */
    isRowResizable?: boolean;
    control?: IGridColumnControlContext;
    /** Your own options for the column, read back with `getColumnContext`. */
    [key: string]: unknown;
}

/** A column of the grid: AG Grid's definition, with the grid's own `context`. */
export type IGridColDef = Omit<ColDef<IRecord>, 'context'> & {
    /** What the grid's cells and header read about this column, and your own options beside them. */
    context?: IGridColumnContext;
};


/** What a column definition carries in its `context`. */
export const getColumnContext = (colDef: ColDef | null | undefined): IGridColumnContext => colDef?.context ?? {};
