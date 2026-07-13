import * as React from "react";
import { ITab } from "../../form/FormModel";

export const TabContext = React.createContext<ITab | null>(null);

export const useTabContext = (): ITab | null => {
    return React.useContext(TabContext);
};
