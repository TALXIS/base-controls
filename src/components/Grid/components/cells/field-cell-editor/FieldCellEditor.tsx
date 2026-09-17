import { ICellRendererParams } from "@ag-grid-community/core";
import { CellEditor } from "../cell-editor/CellEditor";
import { Field } from "../field/Field";
import { Control } from "../control/Control";

export interface IGridFieldCellEditorProps extends ICellRendererParams { }

/** The cell of a record's column while it is being edited. */
export const FieldCellEditor = (props: IGridFieldCellEditorProps) => {
    return <Field record={props.data} name={props.colDef!.colId!}>
        <CellEditor {...props}>
            <Control />
        </CellEditor>
    </Field>;
};
