import * as React from "react";
import type { IFormUiCellProps } from "./Cell";

export const CellContext = React.createContext<IFormUiCellProps | null>(null);
export const DisabledContext = React.createContext<{
    onDisabledChange: (disabled: boolean) => void;
} | null>(null);

export const useDisabledContext = () => {
    return React.useContext(DisabledContext);
}

export const useFormCellContext = (): IFormUiCellProps | null => {
    return React.useContext(CellContext);
};
