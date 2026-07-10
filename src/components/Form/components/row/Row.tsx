import * as React from "react";
import { RowContext } from "./context";
import { useRowsContext } from "../rows";

export interface IFormRowProps {
    height?: string;
    children?: React.ReactNode;
}

export const Row: React.FC<IFormRowProps> = ({ height, children }) => {
    useRowsContext();

    return (
        <RowContext.Provider value={{ height }}>
            {children}
        </RowContext.Provider>
    );
};
