import * as React from "react";
import { IColumnsProps } from "../..";

interface IColumnsContext extends IColumnsProps {
    columnsPerRow: number;
}

export const ColumnsContext = React.createContext<IColumnsContext | null>(null);

export const useColumnsContext = (componentName: string): IColumnsContext | null => {
    return React.useContext(ColumnsContext);
};
