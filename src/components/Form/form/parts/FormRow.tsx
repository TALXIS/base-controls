import * as React from "react";
import type { FormXmlRow } from "@talxis/client-metadata";
import { FormCell } from "./FormCell";

export interface IFormRowProps {
    row: FormXmlRow;
}

export const FormRow: React.FC<IFormRowProps> = ({ row }) => {
    const cells = row.cell ?? [];
    return (
        <div data-id="form-row">
            {cells.map((cell: any, cellIndex: number) => (
                <FormCell key={cell.id ?? cellIndex} cell={cell} />
            ))}
        </div>
    );
};
