import * as React from "react";
import type { IFormUiTabProps } from "./Tab";

export interface ITabContext extends IFormUiTabProps {
    columnsPerRow: number;
}

export const TabContext = React.createContext<ITabContext | null>(null);

export const useTabContext = (): ITabContext | null => {
    return React.useContext(TabContext);
};
