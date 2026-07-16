import * as React from "react";
import type { ITabProps } from "./Tab";

export const TabContext = React.createContext<ITabProps | null>(null);

export const useTabContext = (): ITabProps | null => {
    return React.useContext(TabContext);
};
