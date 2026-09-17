import { ICellRendererParams } from "@ag-grid-community/core";
import { IGridCellRendererParams } from "../../interfaces";
import { CellRenderer } from "../cell-renderer/CellRenderer";
import { IGridCellComponents } from "../cell-renderer/components";
import { Field } from "../field/Field";

export interface IGridFieldCellRendererProps extends ICellRendererParams, IGridCellRendererParams {
    components?: IGridCellComponents;
}

/** The cell of a record's column: bound to the field, and drawing what that field holds. */
export const FieldCellRenderer = (props: IGridFieldCellRendererProps) => {
    return <Field record={props.data} name={props.colDef!.colId!}>
        <CellRenderer {...props} />
    </Field>;
};
