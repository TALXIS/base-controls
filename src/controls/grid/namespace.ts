import { CellEditor } from "./components/cells/cell-editor/CellEditor";
import { CellRenderer } from "./components/cells/cell-renderer/CellRenderer";
import { CellCommands } from "./components/cells/commands/CellCommands";
import { Field } from "./components/cells/field/Field";
import { FieldCellEditor } from "./components/cells/field-cell-editor/FieldCellEditor";
import { FieldCellRenderer } from "./components/cells/field-cell-renderer/FieldCellRenderer";
import { Control } from "./components/cells/control/Control";
import { FieldValidation } from "./components/cells/field-validation/FieldValidation";
import { CellLoading } from "./components/cells/loading/CellLoading";
import { CellContainer } from "./components/cells/container/CellContainer";
import { CellRoot } from "./components/cells/root/CellRoot";
import { CellTheme } from "./components/cells/theme/CellTheme";
import { RowResizeGrip } from "./components/cells/row-resize-grip/RowResizeGrip";
import { NestedReactRoot } from "./components/cells/nested-react-root/NestedReactRoot";
import { ColumnHeader } from "./components/column-header/ColumnHeader";
import { GridUi } from "./components/ui";
import { GridRoot } from "./Grid";

/** Everything a grid is rendered from. */
export interface IGridNamespace {
    /** The grid itself. */
    Root: typeof GridRoot;
    /** A cell holding something other than a record's value. */
    CellRenderer: typeof CellRenderer;
    /** A cell of a record's column, drawing what that column holds. */
    FieldCellRenderer: typeof FieldCellRenderer;
    /** The same cell while it is being edited, with nothing in it to share the row with the input. */
    CellEditor: typeof CellEditor;
    /** A record's column while it is being edited. */
    FieldCellEditor: typeof FieldCellEditor;
    /** A piece of all four: what makes everything inside it one cell. */
    CellRoot: typeof CellRoot;
    /** A piece of all four: what a cell and everything drawn in it is drawn in. */
    CellTheme: typeof CellTheme;
    /** A piece of all four: the element a cell's content is drawn in, and the surface it is drawn on. */
    CellContainer: typeof CellContainer;
    /** A piece of {@link CellRenderer}: what a cell offers to do. */
    CellCommands: typeof CellCommands;
    /** A piece of all four: what stands in for the content it wraps while the cell waits. */
    CellLoading: typeof CellLoading;
    /** A piece of all four: what a row is dragged taller by, around the cell that is dragged. */
    RowResizeGrip: typeof RowResizeGrip;
    /** A piece of the field cells: what binds everything drawn inside it to one record's column. */
    Field: typeof Field;
    /** A piece of a cell: what draws the value, where the cell is bound to a field. */
    Control: typeof Control;
    /** A piece of {@link FieldCellRenderer}: what it says when the record refuses the value. */
    FieldValidation: typeof FieldValidation;
    /** A root of its own for what is drawn in it, so its handlers answer a key before the grid does. */
    NestedReactRoot: typeof NestedReactRoot;
    /** A column's header, with what the grid's own parts add to it. */
    ColumnHeader: typeof ColumnHeader;
    /** What draws the grid's own parts, knowing nothing of the grid. */
    Ui: typeof GridUi;
}

export const Grid: IGridNamespace = {
    Root: GridRoot,
    CellRenderer: CellRenderer,
    FieldCellRenderer: FieldCellRenderer,
    CellEditor: CellEditor,
    FieldCellEditor: FieldCellEditor,
    CellRoot: CellRoot,
    CellTheme: CellTheme,
    CellContainer: CellContainer,
    CellCommands: CellCommands,
    CellLoading: CellLoading,
    RowResizeGrip: RowResizeGrip,
    Field: Field,
    Control: Control,
    FieldValidation: FieldValidation,
    NestedReactRoot: NestedReactRoot,
    ColumnHeader: ColumnHeader,
    Ui: GridUi,
};
