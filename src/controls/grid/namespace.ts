import { CellCommands } from "./components/cells/commands/CellCommands";
import { CellLockIcon } from "./components/cells/lock-icon/CellLockIcon";
import { CellContainer } from "./components/cells/container/CellContainer";
import { CellControl } from "./components/cells/control/CellControl";
import { CellEditor } from "./components/cells/cell-editor/CellEditor";
import { CellEmptyRenderer } from "./components/cells/empty-cell-renderer/CellEmptyRenderer";
import { CellField } from "./components/cells/field/CellField";
import { CellFieldEditor } from "./components/cells/field-cell-editor/CellFieldEditor";
import { CellFieldRenderer } from "./components/cells/field-cell-renderer/CellFieldRenderer";
import { CellLegacyNestedControl } from "./components/cells/legacy-nested-control-renderer/CellLegacyNestedControl";
import { CellLoading } from "./components/cells/loading/CellLoading";
import { CellNestedRoot } from "./components/cells/nested-react-root/CellNestedRoot";
import { CellRenderer } from "./components/cells/cell-renderer/CellRenderer";
import { CellResizeGrip } from "./components/cells/resize-grip/CellResizeGrip";
import { CellRoot } from "./components/cells/root/CellRoot";
import { CellTheme } from "./components/cells/theme/CellTheme";
import { CellFieldError } from "./components/cells/field-error/CellFieldError";
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
import { LoadingOverlay } from "./components/overlays/loading";
import { EmptyRecordsOverlay } from "./components/overlays/empty-records";
import { IOverlayUi, OverlayUi } from "./components/overlays/ui";
import { RowLoading } from "./components/rows/loading";
import { RowError } from "./components/rows/error";
import { IRowUi, RowUi } from "./components/rows/ui";
import { RecordSaveIndicator } from "./components/record-save-indicator/RecordSaveIndicator";
import { RecordSaveIndicatorCell } from "./components/record-save-indicator/RecordSaveIndicatorCell";
import { IRecordSaveUi, RecordSaveUi } from "./components/record-save-indicator/ui";
import { RecordLockIndicatorCell } from "./components/record-lock-indicator/RecordLockIndicatorCell";
import { RecordLockIcon } from "./components/record-lock-indicator/record-lock-icon/RecordLockIcon";
import { GridRoot } from "./Grid";

/** Everything a cell is drawn from. */
export interface IGridCellNamespace {
    /** A cell holding something other than a record's value: `colDef.cellRenderer`. */
    Renderer: typeof CellRenderer;
    /** A cell of a record's column, drawing what that column holds. */
    FieldRenderer: typeof CellFieldRenderer;
    /** A cell with nothing drawn in it, for a column that holds no value. */
    EmptyRenderer: typeof CellEmptyRenderer;
    /** The same cell while it is being edited: `colDef.cellEditor`. */
    Editor: typeof CellEditor;
    /** A record's column while it is being edited. */
    FieldEditor: typeof CellFieldEditor;
    /** What makes everything inside it one cell. */
    Root: typeof CellRoot;
    /** What a cell and everything drawn in it is drawn in. */
    Theme: typeof CellTheme;
    /** The element and surface a cell's content is drawn on. */
    Container: typeof CellContainer;
    /** What stands in for the content it wraps while the cell waits. */
    Loading: typeof CellLoading;
    /** What the cell says when the record refuses the value. */
    FieldError: typeof CellFieldError;
    /** What draws the value, where the cell is bound to a field. */
    Control: typeof CellControl;
    /** What the cell offers to do. */
    Commands: typeof CellCommands;
    /** What says the cell is locked for its record. */
    LockIcon: typeof CellLockIcon;
    /** What a row is dragged taller by, around the cell that is dragged. */
    ResizeGrip: typeof CellResizeGrip;
    /** What binds everything drawn inside it to one record's column. */
    Field: typeof CellField;
    /** A root of its own so its handlers answer a key before the grid does. */
    NestedRoot: typeof CellNestedRoot;
    /** What draws a column that named a control of its own. */
    LegacyNestedControl: typeof CellLegacyNestedControl;
    /** What draws a cell without knowing why. */
    Ui: ICellUi;
}

/** Everything a column header is drawn from. */
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
    /** What is drawn after the name, the lock icon included. */
    Suffix: typeof ColumnHeaderSuffix;
    /** What the header opens over the grid. */
    Menu: typeof ColumnHeaderMenu;
    /** What draws a column header without knowing which column. */
    Ui: IColumnHeaderUi;
}

/** What the grid draws over its rows. */
export interface IGridOverlayNamespace {
    /** What the grid shows while it loads, its parts set through `components.loadingOverlay`. */
    Loading: typeof LoadingOverlay;
    /** What the grid shows while it has no rows, its parts set through `components.emptyRecordsOverlay`. */
    EmptyRecords: typeof EmptyRecordsOverlay;
    /** What draws an overlay without knowing why it is shown. */
    Ui: IOverlayUi;
}

/** What the grid draws across a whole row. */
export interface IGridRowNamespace {
    /** What a row shows while its records load, its parts set through `components.rowLoading`. */
    Loading: typeof RowLoading;
    /** A row standing in for records that failed, its parts set through `components.rowError`. */
    Error: typeof RowError;
    /** What draws a full-width row without knowing which row. */
    Ui: IRowUi;
}

/** What a row says about its last save. */
export interface IGridRecordSaveNamespace {
    /** The save status of the cell's record, or the children while there is none: drawn in the checkbox cell. */
    Indicator: typeof RecordSaveIndicator;
    /** The cell a row reports its save in, on a grid with no checkbox column. */
    Cell: typeof RecordSaveIndicatorCell;
    /** What draws a save status without knowing which record. */
    Ui: IRecordSaveUi;
}

/** What says a record is locked as a whole. */
export interface IGridRecordLockNamespace {
    /** The lock drawn for a record locked as a whole, or nothing. */
    Icon: typeof RecordLockIcon;
    /** The cell a locked record's row shows its lock in. */
    Cell: typeof RecordLockIndicatorCell;
}

/** Everything a grid is rendered from. */
export interface IGridNamespace {
    /** The grid itself. */
    Root: typeof GridRoot;
    /** Everything a cell is drawn from. */
    Cell: IGridCellNamespace;
    /** Everything a column header is drawn from. */
    ColumnHeader: IGridColumnHeaderNamespace;
    /** What the grid draws over its rows. */
    Overlay: IGridOverlayNamespace;
    /** What the grid draws across a whole row. */
    Row: IGridRowNamespace;
    /** What a row says about its last save. */
    RecordSave: IGridRecordSaveNamespace;
    /** What says a record is locked as a whole. */
    RecordLock: IGridRecordLockNamespace;
}

export const Grid: IGridNamespace = {
    Root: GridRoot,
    Cell: {
        Renderer: CellRenderer,
        FieldRenderer: CellFieldRenderer,
        EmptyRenderer: CellEmptyRenderer,
        Editor: CellEditor,
        FieldEditor: CellFieldEditor,
        Root: CellRoot,
        Theme: CellTheme,
        Container: CellContainer,
        Loading: CellLoading,
        FieldError: CellFieldError,
        Control: CellControl,
        Commands: CellCommands,
        LockIcon: CellLockIcon,
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
    Overlay: {
        Loading: LoadingOverlay,
        EmptyRecords: EmptyRecordsOverlay,
        Ui: OverlayUi,
    },
    Row: {
        Loading: RowLoading,
        Error: RowError,
        Ui: RowUi,
    },
    RecordSave: {
        Indicator: RecordSaveIndicator,
        Cell: RecordSaveIndicatorCell,
        Ui: RecordSaveUi,
    },
    RecordLock: {
        Icon: RecordLockIcon,
        Cell: RecordLockIndicatorCell,
    },
};
