import * as React from "react";
import type { ITabProps } from "./Tab";

export interface ITabContext extends ITabProps {
    columnsPerRow: number;
}

export const TabContext = React.createContext<ITabContext | null>(null);

export const useTabContext = (): ITabContext | null => {
    return React.useContext(TabContext);
};
