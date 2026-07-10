import * as React from "react";

export interface ITabsContextValue {
    activeTabId?: string;
    activeTabName?: string;
}

export const TabsContext = React.createContext<ITabsContextValue | null>(null);

export const useTabsContext = (): ITabsContextValue => {
    const context = React.useContext(TabsContext);
    if (context === null) {
        throw new Error("[Form] Tab must be rendered inside Tabs.");
    }

    return context;
};
