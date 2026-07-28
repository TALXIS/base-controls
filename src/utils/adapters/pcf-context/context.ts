import React from "react";

export const PcfContext = React.createContext<ComponentFramework.Context<any, any> | null>(null);

/**
 * Returns the current PCF context from {@link PcfContext}.
 *
 * Throws when used outside of `PcfContextProvider`.
 */
export const usePcfContext = () => {
    const context = React.useContext(PcfContext);
    if (!context) {
        throw new Error("usePcfContext must be used within a PcfContextProvider");
    }
    return context;
}
