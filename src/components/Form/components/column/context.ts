import * as React from "react";

export interface IColumnContextValue {
    width?: React.CSSProperties["width"];
}

export const ColumnContext = React.createContext<IColumnContextValue | null>(null);

export const useColumnContext = (): IColumnContextValue => {
    const context = React.useContext(ColumnContext);
    if (context === null) {
        throw new Error("[Form] Sections must be rendered inside Column.");
    }

    return context;
};
