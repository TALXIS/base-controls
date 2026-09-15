import { CellEditor } from "./components/cells/cell-editor/CellEditor";
import { CellRenderer } from "./components/cells/cell-renderer/CellRenderer";
import { CellCommands } from "./components/cells/commands/CellCommands";
import { ControlRenderer } from "./components/cells/control-renderer/ControlRenderer";
import { Field } from "./components/cells/field/Field";
import { FieldCellEditor } from "./components/cells/field-cell-editor/FieldCellEditor";
import { FieldCellRenderer } from "./components/cells/field-cell-renderer/FieldCellRenderer";
import { FieldControl } from "./components/cells/field-control/FieldControl";
import { FieldValidation } from "./components/cells/field-validation/FieldValidation";
import { CellLoading } from "./components/cells/loading/CellLoading";
import { CellContainer } from "./components/cells/container/CellContainer";
import { CellRoot } from "./components/cells/root/CellRoot";
import { RowResizeGrip } from "./components/cells/row-resize-grip/RowResizeGrip";
import { GridRoot } from "./Grid";

/** Everything a grid is rendered from. */
export interface IGridNamespace {
    /** The grid itself. */
    Root: typeof GridRoot;
    /** A cell holding something other than a record's value: a consumer's own content, in a grid's cell. */
    CellRenderer: typeof CellRenderer;
    /** A cell of a record's column, drawing what that column holds. What a dataset column is drawn with. */
    FieldCellRenderer: typeof FieldCellRenderer;
    /** The same cell while it is being edited, with nothing in it to share the row with the editor. */
    CellEditor: typeof CellEditor;
    /** A record's column while it is being edited. What a dataset column is edited with. */
    FieldCellEditor: typeof FieldCellEditor;
    /** A piece of all four: what makes everything inside it one cell. The only piece AG Grid's parameters go to. */
    CellRoot: typeof CellRoot;
    /** A piece of all four: the element a cell's content is drawn in, on the surface of the cell's theme. */
    CellContainer: typeof CellContainer;
    /** A piece of {@link CellRenderer}: what a cell offers to do. */
    CellCommands: typeof CellCommands;
    /** A piece of all four: what is drawn in place of whatever is wrapped in it while the cell waits. */
    CellLoading: typeof CellLoading;
    /** A piece of all four: what a row is dragged taller by, around the cell that is dragged. */
    RowResizeGrip: typeof RowResizeGrip;
    /** A piece of the field cells: what binds everything drawn inside it to one record's column. */
    Field: typeof Field;
    /** A piece of the field cells: what draws the value of the field it is drawn inside. */
    FieldControl: typeof FieldControl;
    /** A piece of {@link FieldControl}: what the control it made draws the value with. */
    ControlRenderer: typeof ControlRenderer;
    /** A piece of {@link FieldCellRenderer}: what it says when the record refuses the value. */
    FieldValidation: typeof FieldValidation;
}

export const Grid: IGridNamespace = {
    Root: GridRoot,
    CellRenderer: CellRenderer,
    FieldCellRenderer: FieldCellRenderer,
    CellEditor: CellEditor,
    FieldCellEditor: FieldCellEditor,
    CellRoot: CellRoot,
    CellContainer: CellContainer,
    CellCommands: CellCommands,
    CellLoading: CellLoading,
    RowResizeGrip: RowResizeGrip,
    Field: Field,
    FieldControl: FieldControl,
    ControlRenderer: ControlRenderer,
    FieldValidation: FieldValidation,
};
