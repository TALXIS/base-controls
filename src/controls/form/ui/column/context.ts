import * as React from "react";
import type { IFormUiColumnProps } from "./Column";

export const ColumnContext = React.createContext<IFormUiColumnProps | null>(null);

export const useColumnContext = (componentName: string): IFormUiColumnProps => {
    const context = React.useContext(ColumnContext);
    if (context === null) {
        throw new Error(`[Form] ${componentName} must be rendered inside Column.`);
    }

    return context;
};
