import { ICellEditorProps } from "../cell-editor/CellEditor";
import { CellOverridableEditor } from "../overridable-cell-editor/CellOverridableEditor";
import { CellField } from "../field/CellField";

export interface ICellFieldEditorProps extends ICellEditorProps { }

/** The cell of a record's column while it is being edited. */
export const CellFieldEditor = (props: ICellFieldEditorProps) => {
    return <CellField record={props.data} name={props.colDef!.colId!}>
        <CellOverridableEditor {...props} />
    </CellField>;
};
