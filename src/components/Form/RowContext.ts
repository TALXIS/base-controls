import * as React from "react";

export const RowContext = React.createContext<boolean | null>(null);

export const useRowContext = (): true => {
    const context = React.useContext(RowContext);
    if (context === null) {
        throw new Error("[Form] Cell must be rendered inside Row.");
    }

    return true;
};
