import * as React from "react";
import { ICell } from "../..";

export const CellContext = React.createContext<ICell| null>(null);


export const useFormCellContext = (): ICell | null => {
    return React.useContext(CellContext);
};
