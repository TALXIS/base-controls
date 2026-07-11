import * as React from "react";

export const ColumnsContext = React.createContext<boolean | null>(null);

export const useColumnsContext = (componentName: string): true => {
    const context = React.useContext(ColumnsContext);
    if (context === null) {
        throw new Error(`[Form] ${componentName} must be rendered inside Columns.`);
    }

    return true;
};
