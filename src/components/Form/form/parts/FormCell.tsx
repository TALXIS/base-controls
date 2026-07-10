import * as React from "react";
import type { FormXmlCell } from "@talxis/client-metadata";
import { Cell } from "../../Cell";
import { Control } from "../../Control";

export interface IFormCellProps {
    cell: FormXmlCell;
}

export const FormCell: React.FC<IFormCellProps> = ({ cell }) => {
    const control = cell.control;
    const isSpacer = cell.userspacer === true;

    if (!control && !isSpacer) {
        return null;
    }

    return (
        <Cell
            id={cell.id}
            controlId={control?.id}
            datafieldname={control?.datafieldname}
            visible={cell.visible !== false}
            colspan={cell.colspan}
            rowspan={cell.rowspan}
            userspacer={isSpacer}
            showLabel={cell.showlabel !== false}
        >
            {control ? (
                <Control
                    classid={control.classid ?? ""}
                    cellId={cell.id}
                />
            ) : null}
        </Cell>
    );
};
