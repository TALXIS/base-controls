import * as React from "react";
import type { IColumnProps } from "./Column";

export const ColumnContext = React.createContext<IColumnProps | null>(null);

export const useColumnContext = (componentName: string): IColumnProps => {
    const context = React.useContext(ColumnContext);
    if (context === null) {
        throw new Error(`[Form] ${componentName} must be rendered inside Column.`);
    }

    return context;
};
