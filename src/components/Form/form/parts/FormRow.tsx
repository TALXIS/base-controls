import * as React from "react";
import type { FormXmlRow } from "@talxis/client-metadata";
import { Row } from "../../Row";
import { FormCell } from "./FormCell";

export interface IFormRowProps {
    row: FormXmlRow;
}

export const FormRow: React.FC<IFormRowProps> = ({ row }) => (
    <Row>
        {(row.cell ?? []).map((cell, cellIndex) => (
            <FormCell
                key={cell.id ?? cellIndex}
                cell={cell}
            />
        ))}
    </Row>
);
