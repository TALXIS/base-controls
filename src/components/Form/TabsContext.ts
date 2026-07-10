import * as React from "react";

export const TabsContext = React.createContext<boolean | null>(null);

export const useTabsContext = (): true => {
    const context = React.useContext(TabsContext);
    if (context === null) {
        throw new Error("[Form] Tab must be rendered inside Tabs.");
    }

    return true;
};
