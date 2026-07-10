import * as React from "react";

export interface IRowContextValue {
    height?: string;
}

export const RowContext = React.createContext<IRowContextValue | null>(null);

export const useRowContext = (): IRowContextValue => {
    const context = React.useContext(RowContext);
    if (context === null) {
        throw new Error("[Form] Cell must be rendered inside Row.");
    }

    return context;
};
