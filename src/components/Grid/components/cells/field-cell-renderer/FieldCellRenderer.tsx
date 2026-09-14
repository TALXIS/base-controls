import { ICellRendererParams } from "@ag-grid-community/core";
import { CellRenderer } from "../cell-renderer/CellRenderer";
import { Field } from "../field/Field";
import { FieldControl } from "../field-control/FieldControl";
import { FieldValidation } from "../field-validation/FieldValidation";

export interface IGridFieldCellRendererProps extends ICellRendererParams {
    /**
     * Whether the cell takes input rather than only drawing its value, which a one-click-edit column's
     * cell does without an editor ever being opened.
     */
    editing?: boolean;
}

/**
 * The cell of a record's column: bound to the field, and drawing what that field holds.
 *
 * What the grid draws for every dataset column, and what a consumer renders for a column of their own that
 * holds a value. A column the record has no field for - the checkboxes, the column a save is reported in,
 * a column the grid added itself - takes `Grid.CellRenderer` instead: this one would bind a field that is
 * not one.
 *
 * The binding goes around the cell rather than inside it, which is what lets everything drawn in the cell
 * read the field - the mark on a value the record refuses as much as the control.
 */
export const FieldCellRenderer = (props: IGridFieldCellRendererProps) => {
    return <Field record={props.data} name={props.colDef!.colId!}>
        <CellRenderer {...props}>
            <FieldValidation />
            <FieldControl editing={props.editing} />
        </CellRenderer>
    </Field>;
};
