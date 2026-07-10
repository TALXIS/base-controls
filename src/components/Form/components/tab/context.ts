import * as React from "react";

export interface ITabContextValue {
    id?: string;
    name?: string;
    group?: string;
    verticalLayout?: boolean;
    showLabel?: boolean;
    labelId?: string;
    isUserDefined?: string;
    lockLevel?: number;
    addedBy?: string;
    expanded?: boolean;
    visible?: boolean;
    availableForPhone?: boolean;
    collapsible?: boolean;
}

export const TabContext = React.createContext<ITabContextValue | null>(null);

export const useTabContext = (): ITabContextValue => {
    const context = React.useContext(TabContext);
    if (context === null) {
        throw new Error("[Form] Section must be rendered inside Tab.");
    }

    return context;
};
