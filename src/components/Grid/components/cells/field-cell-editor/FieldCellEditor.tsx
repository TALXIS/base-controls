import { ICellRendererParams } from "@ag-grid-community/core";
import { CellEditor } from "../cell-editor/CellEditor";
import { Field } from "../field/Field";
import { FieldControl } from "../field-control/FieldControl";

export interface IGridFieldCellEditorProps extends ICellRendererParams { }

/**
 * The cell of a record's column while it is being edited.
 *
 * What AG Grid opens over a `Grid.FieldCellRenderer`: the same field, drawn by a control that takes input
 * rather than one that only shows the value, and nothing else in the cell to share the row with it.
 */
export const FieldCellEditor = (props: IGridFieldCellEditorProps) => {
    return <Field record={props.data} name={props.colDef!.colId!}>
        <CellEditor {...props}>
            <FieldControl />
        </CellEditor>
    </Field>;
};
