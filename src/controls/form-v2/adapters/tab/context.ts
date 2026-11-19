import React from "react";
import type { IFormTab } from "../../runtime/parts/tab/FormTab";

export const FormTabContext = React.createContext<IFormTab | undefined>(undefined);

/** The tab the component is drawn in, if any. */
export const useOptionalFormTab = (): IFormTab | undefined => {
    return React.useContext(FormTabContext);
};
