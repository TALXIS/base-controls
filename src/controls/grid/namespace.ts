import { CellCommands } from "./components/cells/commands/CellCommands";
import { CellContainer } from "./components/cells/container/CellContainer";
import { CellControl } from "./components/cells/control/CellControl";
import { CellEditor } from "./components/cells/cell-editor/CellEditor";
import { CellField } from "./components/cells/field/CellField";
import { CellFieldEditor } from "./components/cells/field-cell-editor/CellFieldEditor";
import { CellFieldRenderer } from "./components/cells/field-cell-renderer/CellFieldRenderer";
import { CellLegacyNestedControl } from "./components/cells/legacy-nested-control-renderer/CellLegacyNestedControl";
import { CellLoading } from "./components/cells/loading/CellLoading";
import { CellNestedRoot } from "./components/cells/nested-react-root/CellNestedRoot";
import { CellRenderer } from "./components/cells/cell-renderer/CellRenderer";
import { CellResizeGrip } from "./components/cells/row-resize-grip/CellResizeGrip";
import { CellRoot } from "./components/cells/root/CellRoot";
import { CellTheme } from "./components/cells/theme/CellTheme";
import { CellValidation } from "./components/cells/field-validation/CellValidation";
import { CellUi, ICellUi } from "./components/cells/ui";
import { ColumnHeaderContainer } from "./components/column-header/container/ColumnHeaderContainer";
import { ColumnHeaderContent } from "./components/column-header/content/ColumnHeaderContent";
import { ColumnHeaderLabel } from "./components/column-header/label/ColumnHeaderLabel";
import { ColumnHeaderMenu } from "./components/column-header/menu/ColumnHeaderMenu";
import { ColumnHeaderPrefix } from "./components/column-header/prefix/ColumnHeaderPrefix";
import { ColumnHeaderRenderer } from "./components/column-header/ColumnHeaderRenderer";
import { ColumnHeaderRequiredMarker } from "./components/column-header/required-marker/ColumnHeaderRequiredMarker";
import { ColumnHeaderRoot } from "./components/column-header/root/ColumnHeaderRoot";
import { ColumnHeaderSuffix } from "./components/column-header/suffix/ColumnHeaderSuffix";
import { ColumnHeaderTheme } from "./components/column-header/theme/ColumnHeaderTheme";
import { ColumnHeaderUi, IColumnHeaderUi } from "./components/column-header/ui";
import { GridRoot } from "./Grid";

/**
 * Everything a cell is drawn from.
 *
 * `Renderer` and `Editor` are what a column definition is given; the rest are the parts they are built
 * from, and `Ui` the pieces those parts draw with.
 */
export interface IGridCellNamespace {
    /** A cell holding something other than a record's value: `colDef.cellRenderer`. */
    Renderer: typeof CellRenderer;
    /** A cell of a record's column, drawing what that column holds. */
    FieldRenderer: typeof CellFieldRenderer;
    /** The same cell while it is being edited: `colDef.cellEditor`. */
    Editor: typeof CellEditor;
    /** A record's column while it is being edited. */
    FieldEditor: typeof CellFieldEditor;
    /** What makes everything inside it one cell. */
    Root: typeof CellRoot;
    /** What a cell and everything drawn in it is drawn in. */
    Theme: typeof CellTheme;
    /** The element a cell's content is drawn in, and the surface it is drawn on. */
    Container: typeof CellContainer;
    /** What stands in for the content it wraps while the cell waits. */
    Loading: typeof CellLoading;
    /** What the cell says when the record refuses the value. */
    Validation: typeof CellValidation;
    /** What draws the value, where the cell is bound to a field. */
    Control: typeof CellControl;
    /** What the cell offers to do. */
    Commands: typeof CellCommands;
    /** What a row is dragged taller by, around the cell that is dragged. */
    ResizeGrip: typeof CellResizeGrip;
    /** What binds everything drawn inside it to one record's column. */
    Field: typeof CellField;
    /** A root of its own, so its handlers answer a key before the grid does. */
    NestedRoot: typeof CellNestedRoot;
    /** What draws a column that named a control of its own. */
    LegacyNestedControl: typeof CellLegacyNestedControl;
    /** What draws a cell, and nothing that knows why. */
    Ui: ICellUi;
}

/**
 * Everything a column header is drawn from.
 *
 * `Renderer` is what a column definition is given; the rest are the parts it is built from, and `Ui` the
 * pieces those parts draw with.
 */
export interface IGridColumnHeaderNamespace {
    /** A column's header, with what the grid's own parts add to it: `colDef.headerComponent`. */
    Renderer: typeof ColumnHeaderRenderer;
    /** What makes everything inside it one column's header. */
    Root: typeof ColumnHeaderRoot;
    /** What the header and everything in it is drawn in. */
    Theme: typeof ColumnHeaderTheme;
    /** The element the header is drawn in. */
    Container: typeof ColumnHeaderContainer;
    /** What the modules draw before what names the column. */
    Prefix: typeof ColumnHeaderPrefix;
    /** What the header says the column is, drawn in. */
    Content: typeof ColumnHeaderContent;
    /** What the column is called. */
    Label: typeof ColumnHeaderLabel;
    /** What says the column asks for a value. */
    RequiredMarker: typeof ColumnHeaderRequiredMarker;
    /** What is drawn after the name, the uneditable icon included. */
    Suffix: typeof ColumnHeaderSuffix;
    /** What the header opens over the grid. */
    Menu: typeof ColumnHeaderMenu;
    /** What draws a column header, and nothing that knows which column. */
    Ui: IColumnHeaderUi;
}

/** Everything a grid is rendered from. */
export interface IGridNamespace {
    /** The grid itself. */
    Root: typeof GridRoot;
    /** Everything a cell is drawn from. */
    Cell: IGridCellNamespace;
    /** Everything a column header is drawn from. */
    ColumnHeader: IGridColumnHeaderNamespace;
}

export const Grid: IGridNamespace = {
    Root: GridRoot,
    Cell: {
        Renderer: CellRenderer,
        FieldRenderer: CellFieldRenderer,
        Editor: CellEditor,
        FieldEditor: CellFieldEditor,
        Root: CellRoot,
        Theme: CellTheme,
        Container: CellContainer,
        Loading: CellLoading,
        Validation: CellValidation,
        Control: CellControl,
        Commands: CellCommands,
        ResizeGrip: CellResizeGrip,
        Field: CellField,
        NestedRoot: CellNestedRoot,
        LegacyNestedControl: CellLegacyNestedControl,
        Ui: CellUi,
    },
    ColumnHeader: {
        Renderer: ColumnHeaderRenderer,
        Root: ColumnHeaderRoot,
        Theme: ColumnHeaderTheme,
        Container: ColumnHeaderContainer,
        Prefix: ColumnHeaderPrefix,
        Content: ColumnHeaderContent,
        Label: ColumnHeaderLabel,
        RequiredMarker: ColumnHeaderRequiredMarker,
        Suffix: ColumnHeaderSuffix,
        Menu: ColumnHeaderMenu,
        Ui: ColumnHeaderUi,
    },
};
