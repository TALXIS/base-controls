import { ICellRendererParams } from "@ag-grid-community/core";
import { CellEditor } from "../cell-editor/CellEditor";
import { IGridCellEditorComponents } from "../cell-editor/components";
import { Field } from "../field/Field";

export interface IGridFieldCellEditorProps extends ICellRendererParams {
    components?: IGridCellEditorComponents;
}

/** The cell of a record's column while it is being edited. */
export const FieldCellEditor = (props: IGridFieldCellEditorProps) => {
    return <Field record={props.data} name={props.colDef!.colId!}>
        <CellEditor {...props} />
    </Field>;
};
