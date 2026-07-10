import * as React from "react";
import type { FormXmlRow } from "@talxis/client-metadata";
import { Row } from "../../components";
import { FormCell } from "./FormCell";

export interface IFormRowProps {
    row: FormXmlRow;
}

export const FormRow = ({ row }: IFormRowProps) => {
    return (
        <Row height={row.height}>
            {(row.cell ?? []).map((cell, cellIndex) => (
                <FormCell
                    key={cell.id ?? cellIndex}
                    cell={cell}
                />
            ))}
        </Row>
    );
};
