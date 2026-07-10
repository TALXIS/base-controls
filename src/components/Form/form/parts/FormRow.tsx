import * as React from "react";
import type { FormXmlRow } from "@talxis/client-metadata";
import { Row } from "../../Row";
import { FormCell } from "./FormCell";

export interface IFormRowProps {
    row: FormXmlRow;
}

export const FormRow: React.FC<IFormRowProps> = ({ row }) => {
    const cells = row.cell ?? [];
    const resolvedHeightUnits = Math.max(1, ...cells.map((cell) => cell.rowspan ?? 1));

    return (
        <Row layoutHeightUnits={resolvedHeightUnits}>
            {cells.map((cell, cellIndex) => (
                <FormCell
                    key={cell.id ?? cellIndex}
                    cell={cell}
                />
            ))}
        </Row>
    );
};
