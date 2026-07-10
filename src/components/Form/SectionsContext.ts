import * as React from "react";

export const SectionsContext = React.createContext<boolean | null>(null);

export const useSectionsContext = (): true => {
    const context = React.useContext(SectionsContext);
    if (context === null) {
        throw new Error("[Form] Section must be rendered inside Sections.");
    }

    return true;
};
