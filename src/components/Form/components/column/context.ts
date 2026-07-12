import * as React from "react";
import type { IFormColumnProps } from "./Column";

export const ColumnContext = React.createContext<IFormColumnProps | null>(null);

export const useColumnContext = (componentName: string): IFormColumnProps => {
    const context = React.useContext(ColumnContext);
    if (context === null) {
        throw new Error(`[Form] ${componentName} must be rendered inside Column.`);
    }

    return context;
};
