import React from "react";

export const PcfContextProvider = React.createContext<ComponentFramework.Context<any, any> | null>(null);

export const usePcfContext = () => {
    const context = React.useContext(PcfContextProvider);
    if (!context) {
        throw new Error("usePcfContext must be used within a PcfContextProvider");
    }
    return context;
}