import { ICellRendererParams } from "@ag-grid-community/core";
import { IGridCellRendererParams } from "../../interfaces";
import { CellRenderer } from "../cell-renderer/CellRenderer";
import { Field } from "../field/Field";
import { Control } from "../control/Control";
import { FieldValidation } from "../field-validation/FieldValidation";

export interface IGridFieldCellRendererProps extends ICellRendererParams, IGridCellRendererParams { }

/** The cell of a record's column: bound to the field, and drawing what that field holds. */
export const FieldCellRenderer = (props: IGridFieldCellRendererProps) => {
    return <Field record={props.data} name={props.colDef!.colId!}>
        <CellRenderer {...props}>
            <FieldValidation />
            <Control />
        </CellRenderer>
    </Field>;
};
