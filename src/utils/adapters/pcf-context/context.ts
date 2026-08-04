import React from "react";

export const PcfContext = React.createContext<ComponentFramework.Context<any, any> | null>(null);

PcfContext.displayName = "PcfContext";

/**
 * Returns the current PCF context from {@link PcfContext}.
 *
 * Throws when used outside of `PcfContextProvider`.
 */
export const usePcfContext = () => {
    const context = React.useContext(PcfContext);
    if (!context) {
        throw new Error(`This component must be rendered within ${PcfContext.displayName}.Provider.`);
    }
    return context;
}
