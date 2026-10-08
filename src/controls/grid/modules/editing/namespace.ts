import { CellEditor } from "./components/cell-editor/CellEditor";

//the editing module's cells share their names with the core ones in `Grid.Cell`
export type { ICellEditorProps as IEditingCellEditorProps, ICellEditorComponents as IEditingCellEditorComponents } from "./components/cell-editor";

/** The cells the editing module draws its columns with. */
export interface IEditingCellNamespace {
    /** The cell while it is being edited: `colDef.cellEditor`. */
    Editor: typeof CellEditor;
}

export const EditingCell: IEditingCellNamespace = {
    Editor: CellEditor,
};
