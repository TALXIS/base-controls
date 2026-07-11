import * as React from "react";
import type { IFormColumnProps } from "./Column";

export const ColumnContext = React.createContext<IFormColumnProps | null>(null);

export const useColumnContext = (): IFormColumnProps => {
    const context = React.useContext(ColumnContext);
    if (context === null) {
        throw new Error("[Form] Sections must be rendered inside Column.");
    }

    return context;
};
