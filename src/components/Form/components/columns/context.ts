import * as React from "react";
import { IColumnsProps } from "../..";

interface IColumnsContext extends IColumnsProps {
    columnsPerRow: number;
}

export const ColumnsContext = React.createContext<IColumnsContext | null>(null);

export const useColumnsContext = (componentName: string): IColumnsContext => {
    const context = React.useContext(ColumnsContext);
    if (context === null) {
        throw new Error(`[Form] ${componentName} must be rendered inside Columns.`);
    }

    return context;
};
