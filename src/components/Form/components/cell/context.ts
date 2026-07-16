import * as React from "react";
import type { ICellProps } from "./Cell";

export const CellContext = React.createContext<ICellProps | null>(null);


export const useFormCellContext = (): ICellProps | null => {
    return React.useContext(CellContext);
};
