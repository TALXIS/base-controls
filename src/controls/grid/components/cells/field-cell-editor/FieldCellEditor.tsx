import { CellEditor, IGridCellEditorProps } from "../cell-editor/CellEditor";
import { Field } from "../field/Field";

export interface IGridFieldCellEditorProps extends IGridCellEditorProps { }

/** The cell of a record's column while it is being edited. */
export const FieldCellEditor = (props: IGridFieldCellEditorProps) => {
    return <Field record={props.data} name={props.colDef!.colId!}>
        <CellEditor {...props} />
    </Field>;
};
