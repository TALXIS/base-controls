import * as React from "react";

export const ColumnsContext = React.createContext<boolean | null>(null);

export const useColumnsContext = (): true => {
    const context = React.useContext(ColumnsContext);
    if (context === null) {
        throw new Error("[Form] Column must be rendered inside Columns.");
    }

    return true;
};
