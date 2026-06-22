import * as React from "react";
import type { FormXmlCell } from "@talxis/client-metadata";
import { Cell } from "../../Cell";
import { Control } from "../../Control";

export interface IFormCellProps {
    cell: FormXmlCell;
}

export const FormCell: React.FC<IFormCellProps> = ({ cell }) => {
    const control = cell.control;

    if (!control) {
        return null;
    }

    return (
        <Cell
            id={cell.id}
            controlId={control.id}
            datafieldname={control.datafieldname}
        >
            <Control
                classid={control.classid ?? ""}
                cellId={cell.id}
            />
        </Cell>
    );
};
