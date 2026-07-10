import * as React from "react";

export const RowsContext = React.createContext<boolean | null>(null);

export const useRowsContext = (): true => {
    const context = React.useContext(RowsContext);
    if (context === null) {
        throw new Error("[Form] Row must be rendered inside Rows.");
    }

    return true;
};
