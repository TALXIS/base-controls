import { Cell } from "./components/cells/cell/Cell";
import { CellCommands } from "./components/cells/commands/CellCommands";
import { Field } from "./components/cells/field/Field";
import { FieldCell } from "./components/cells/field-cell/FieldCell";
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
    Cell: typeof Cell;
    /** A cell of a record's column, drawing what that column holds. What a dataset column is drawn with. */
    FieldCell: typeof FieldCell;
    /** A piece of both: what makes everything inside it one cell. The only piece AG Grid's parameters go to. */
    CellRoot: typeof CellRoot;
    /** A piece of both: the element a cell's content is drawn in, on the surface of the cell's theme. */
    CellContainer: typeof CellContainer;
    /** A piece of both: what a cell offers to do. */
    CellCommands: typeof CellCommands;
    /** A piece of both: what is drawn in place of whatever is wrapped in it while the cell waits. */
    CellLoading: typeof CellLoading;
    /** A piece of both: what a row is dragged taller by, around the cell that is dragged. */
    RowResizeGrip: typeof RowResizeGrip;
    /** A piece of {@link FieldCell}: what binds everything drawn inside it to one record's column. */
    Field: typeof Field;
    /** A piece of {@link FieldCell}: what draws the value of the field it is drawn inside. */
    FieldControl: typeof FieldControl;
    /** A piece of {@link FieldCell}: what it says when the record refuses the value. */
    FieldValidation: typeof FieldValidation;
}

export const Grid: IGridNamespace = {
    Root: GridRoot,
    Cell: Cell,
    FieldCell: FieldCell,
    CellRoot: CellRoot,
    CellContainer: CellContainer,
    CellCommands: CellCommands,
    CellLoading: CellLoading,
    RowResizeGrip: RowResizeGrip,
    Field: Field,
    FieldControl: FieldControl,
    FieldValidation: FieldValidation,
};
