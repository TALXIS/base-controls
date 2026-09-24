import { ICellRendererProps } from "../cell-renderer/CellRenderer";
import { CellOverridableRenderer } from "../overridable-cell-renderer/CellOverridableRenderer";
import { CellField } from "../field/CellField";

export interface ICellFieldRendererProps extends ICellRendererProps { }

/** The cell of a record's column: bound to the field, and drawing what that field holds. */
export const CellFieldRenderer = (props: ICellFieldRendererProps) => {
    return <CellField record={props.data} name={props.colDef!.colId!}>
        <CellOverridableRenderer {...props} />
    </CellField>;
};
