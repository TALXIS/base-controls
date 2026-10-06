import { CellEditor } from "./components/cell-editor/CellEditor";
import { CellFieldEditor } from "./components/field-cell-editor/CellFieldEditor";
import { CellFieldRenderer } from "./components/field-cell-renderer/CellFieldRenderer";
import { CellRenderer } from "./components/cell-renderer/CellRenderer";
import { CellRoot } from "./components/root/CellRoot";

//the editing module's cells share their names with the core ones in `Grid.Cell`
export type { ICellRootProps as IEditingCellRootProps } from "./components/root";
export type { ICellRendererProps as IEditingCellRendererProps, ICellRendererComponents as IEditingCellRendererComponents } from "./components/cell-renderer";
export type { ICellFieldRendererProps as IEditingCellFieldRendererProps } from "./components/field-cell-renderer";
export type { ICellEditorProps as IEditingCellEditorProps, ICellEditorComponents as IEditingCellEditorComponents } from "./components/cell-editor";
export type { ICellFieldEditorProps as IEditingCellFieldEditorProps } from "./components/field-cell-editor";

/** The cells the editing module draws its columns with. */
export interface IEditingCellNamespace {
    /** A cell that also says when it is locked for its record. */
    Renderer: typeof CellRenderer;
    /** A record's column, drawn with `Renderer`. */
    FieldRenderer: typeof CellFieldRenderer;
    /** The cell while it is being edited: `colDef.cellEditor`. */
    Editor: typeof CellEditor;
    /** A record's column while it is being edited. */
    FieldEditor: typeof CellFieldEditor;
    /** `Grid.Cell.Root` for a cell that takes input as an editor or a one-click column. */
    Root: typeof CellRoot;
}

export const EditingCell: IEditingCellNamespace = {
    Renderer: CellRenderer,
    FieldRenderer: CellFieldRenderer,
    Editor: CellEditor,
    FieldEditor: CellFieldEditor,
    Root: CellRoot,
};
