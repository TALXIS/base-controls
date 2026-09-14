import { Cell } from "./components/cells/cell/Cell";
import { CellCommands } from "./components/cells/commands/CellCommands";
import { Field } from "./components/cells/field/Field";
import { FieldCell } from "./components/cells/field-cell/FieldCell";
import { FieldControl } from "./components/cells/field-control/FieldControl";
import { FieldValidation } from "./components/cells/field-validation/FieldValidation";
import { CellRoot } from "./components/cells/root/CellRoot";
import { GridRoot } from "./Grid";

/** Everything a grid is rendered from. */
export interface IGridNamespace {
    /** The grid itself. */
    Root: typeof GridRoot;
    /** A cell holding something other than a record's value: a consumer's own content, in a grid's cell. */
    Cell: typeof Cell;
    /** A cell of a record's column, drawing what that column holds. What a dataset column is drawn with. */
    FieldCell: typeof FieldCell;
    /** A piece of {@link Cell} and {@link FieldCell}: the cell itself, with nothing in it yet. */
    CellRoot: typeof CellRoot;
    /** A piece of both: what a cell offers to do. */
    CellCommands: typeof CellCommands;
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
    CellCommands: CellCommands,
    Field: Field,
    FieldControl: FieldControl,
    FieldValidation: FieldValidation,
};
