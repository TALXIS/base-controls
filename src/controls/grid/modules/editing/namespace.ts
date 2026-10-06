import { CellEditor } from "./components/cell-editor/CellEditor";
import { CellRenderer } from "./components/cell-renderer/CellRenderer";
import { CellRoot } from "./components/root/CellRoot";

//the editing module's cells share their names with the core ones in `Grid.Cell`
export type { ICellRootProps as IEditingCellRootProps } from "./components/root";
export type { ICellRendererProps as IEditingCellRendererProps, ICellRendererComponents as IEditingCellRendererComponents } from "./components/cell-renderer";
export type { ICellEditorProps as IEditingCellEditorProps, ICellEditorComponents as IEditingCellEditorComponents } from "./components/cell-editor";

/** The cells the editing module draws its columns with. */
export interface IEditingCellNamespace {
    /** A cell that also says when it is locked for its record. */
    Renderer: typeof CellRenderer;
    /** The cell while it is being edited: `colDef.cellEditor`. */
    Editor: typeof CellEditor;
    /** `Grid.Cell.Root` for a cell that takes input as an editor or a one-click column. */
    Root: typeof CellRoot;
}

export const EditingCell: IEditingCellNamespace = {
    Renderer: CellRenderer,
    Editor: CellEditor,
    Root: CellRoot,
};
