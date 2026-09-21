import { CellRenderer, IGridCellRendererProps } from "../cell-renderer/CellRenderer";
import { Field } from "../field/Field";

export interface IGridFieldCellRendererProps extends IGridCellRendererProps { }

/** The cell of a record's column: bound to the field, and drawing what that field holds. */
export const FieldCellRenderer = (props: IGridFieldCellRendererProps) => {
    return <Field record={props.data} name={props.colDef!.colId!}>
        <CellRenderer {...props} />
    </Field>;
};
