import { ICellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { useGridComponents } from "../../../context";
import { RowUi } from "../ui";

export interface IRowErrorProps extends ICellRendererParams<IRecord> {
    /** What went wrong. */
    errorMessage: string;
}

/** A row standing in for records that failed: `fullWidthCellRenderer`. */
export const RowError = (props: IRowErrorProps) => {
    const components = useGridComponents();

    return <RowUi.Error message={props.errorMessage} components={components.rows?.error} />;
};
