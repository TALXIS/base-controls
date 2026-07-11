import * as React from "react";
import type { IFormCellProps } from "./Cell";

export const FormCellContext = React.createContext<IFormCellProps | null>(null);

export const useFormCellContext = (): IFormCellProps => {
    const context = React.useContext(FormCellContext);
    if (context === null) {
        throw new Error("[Form] Control must be rendered inside Cell.");
    }

    return context;
};
