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
import { ColumnHeaderRoot } from "./components/column-header/root/ColumnHeaderRoot";
import { ColumnHeaderTheme } from "./components/column-header/theme/ColumnHeaderTheme";
import { ColumnHeaderContainer } from "./components/column-header/container/ColumnHeaderContainer";
import { ColumnHeaderPrefix } from "./components/column-header/prefix/ColumnHeaderPrefix";
import { ColumnHeaderContent } from "./components/column-header/content/ColumnHeaderContent";
import { ColumnHeaderLabel } from "./components/column-header/label/ColumnHeaderLabel";
import { ColumnHeaderMenu } from "./components/column-header/menu/ColumnHeaderMenu";
import { ColumnHeaderRequiredMarker } from "./components/column-header/required-marker/ColumnHeaderRequiredMarker";
import { ColumnHeaderSuffix } from "./components/column-header/suffix/ColumnHeaderSuffix";
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
    /** A piece of {@link ColumnHeader}: what makes everything inside it one column's header. */
    ColumnHeaderRoot: typeof ColumnHeaderRoot;
    /** A piece of {@link ColumnHeader}: what the header and everything in it is drawn in. */
    ColumnHeaderTheme: typeof ColumnHeaderTheme;
    /** A piece of {@link ColumnHeader}: the element the header is drawn in. */
    ColumnHeaderContainer: typeof ColumnHeaderContainer;
    /** A piece of {@link ColumnHeader}: what the modules draw before what names the column. */
    ColumnHeaderPrefix: typeof ColumnHeaderPrefix;
    /** A piece of {@link ColumnHeader}: what the header says the column is, drawn in. */
    ColumnHeaderContent: typeof ColumnHeaderContent;
    /** A piece of {@link ColumnHeader}: what the column is called. */
    ColumnHeaderLabel: typeof ColumnHeaderLabel;
    /** A piece of {@link ColumnHeader}: what says the column asks for a value. */
    ColumnHeaderRequiredMarker: typeof ColumnHeaderRequiredMarker;
    /** A piece of {@link ColumnHeader}: what is drawn after the name. */
    ColumnHeaderSuffix: typeof ColumnHeaderSuffix;
    /** A piece of {@link ColumnHeader}: what it opens over the grid. */
    ColumnHeaderMenu: typeof ColumnHeaderMenu;
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
    ColumnHeaderRoot: ColumnHeaderRoot,
    ColumnHeaderTheme: ColumnHeaderTheme,
    ColumnHeaderContainer: ColumnHeaderContainer,
    ColumnHeaderPrefix: ColumnHeaderPrefix,
    ColumnHeaderContent: ColumnHeaderContent,
    ColumnHeaderLabel: ColumnHeaderLabel,
    ColumnHeaderRequiredMarker: ColumnHeaderRequiredMarker,
    ColumnHeaderSuffix: ColumnHeaderSuffix,
    ColumnHeaderMenu: ColumnHeaderMenu,
};
