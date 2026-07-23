import * as React from "react";
import type { ICellProps } from "./Cell";

export const CellContext = React.createContext<ICellProps | null>(null);
export const DisabledContext = React.createContext<boolean>(false);


export const useDisabledContext = (): boolean => {
    return React.useContext(DisabledContext);
}

export const useFormCellContext = (): ICellProps | null => {
    return React.useContext(CellContext);
};
