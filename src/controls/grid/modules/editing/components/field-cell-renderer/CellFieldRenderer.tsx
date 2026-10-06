import { CellField } from "../../../../components/cells/field/CellField";
import { CellRenderer, ICellRendererProps } from "../cell-renderer/CellRenderer";

export interface ICellFieldRendererProps extends ICellRendererProps { }

/** The cell of a record's column that also says when it is locked for its record. */
export const CellFieldRenderer = (props: ICellFieldRendererProps) => {
    return <CellField record={props.data} name={props.colDef!.colId!}>
        <CellRenderer {...props} />
    </CellField>;
};
