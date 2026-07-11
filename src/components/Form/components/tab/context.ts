import * as React from "react";
import type { IFormTabProps } from "./Tab";

export const TabContext = React.createContext<IFormTabProps | null>(null);

export const useTabContext = (): IFormTabProps => {
    const context = React.useContext(TabContext);
    if (context === null) {
        throw new Error("[Form] Section must be rendered inside Tab.");
    }

    return context;
};
