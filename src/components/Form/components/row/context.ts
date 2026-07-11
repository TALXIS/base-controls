import * as React from "react";
import type { IFormRowProps } from "./Row";

export const RowContext = React.createContext<IFormRowProps | null>(null);

export const useRowContext = (): IFormRowProps => {
    const context = React.useContext(RowContext);
    if (context === null) {
        throw new Error("[Form] Cell must be rendered inside Row.");
    }

    return context;
};
