import React from "react";
import { ICellsProps } from "./Cells";

export const CellsContext = React.createContext<ICellsProps | null>(null);

export const useCellsContext = () => {
    return React.useContext(CellsContext);
}