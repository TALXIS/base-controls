import { ICellRendererParams } from "@ag-grid-community/core";
import { CellCommands } from "../commands/CellCommands";
import { Field } from "../field/Field";
import { FieldControl } from "../field-control/FieldControl";
import { FieldValidation } from "../field-validation/FieldValidation";
import { CellLoading } from "../loading/CellLoading";
import { CellContainer } from "../container/CellContainer";
import { CellRoot } from "../root/CellRoot";
import { RowResizeGrip } from "../row-resize-grip/RowResizeGrip";

export interface IGridFieldCellProps extends ICellRendererParams {
    /**
     * Whether the cell takes input rather than only drawing its value: an editor AG Grid opened, or a
     * one-click-edit column, whose control is the cell.
     */
    editing?: boolean;
}

/**
 * The cell of a record's column: bound to the field, and drawing what that field holds.
 *
 * What the grid draws for every dataset column, as a renderer and as an editor, and what a consumer
 * renders for a column of their own that holds a value. A column the record has no field for - the
 * checkboxes, the column a save is reported in, a column the grid added itself - takes `Grid.Cell`
 * instead: this one would bind a field that is not one.
 */
export const FieldCell = (props: IGridFieldCellProps) => {
    return <CellRoot {...props}>
        <Field record={props.data} name={props.colDef!.colId!}>
            <RowResizeGrip>
                <CellContainer>
                    <CellLoading>
                        <FieldControl editing={props.editing} />
                        <CellCommands />
                        <FieldValidation />
                    </CellLoading>
                </CellContainer>
            </RowResizeGrip>
        </Field>
    </CellRoot>;
};
