import * as React from "react";
import type { ICellProps } from "./Cell";

export const CellContext = React.createContext<ICellProps | null>(null);
export const DisabledContext = React.createContext<{
    onDisabledChange: (disabled: boolean) => void;
} | null>(null);

export const useDisabledContext = () => {
    return React.useContext(DisabledContext);
}

export const useFormCellContext = (): ICellProps | null => {
    return React.useContext(CellContext);
};
