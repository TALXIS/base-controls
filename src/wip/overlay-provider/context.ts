import React from "react";

export interface IOverlayProviderOptions {
    isVisible: boolean;
    message?: string;
}

export interface IOverlayProviderContext {
    isVisible: boolean;
    message?: string;
    toggle: (options: IOverlayProviderOptions) => void;
}

export const OverlayProviderInternalContext = React.createContext<IOverlayProviderContext>(null as any);

export const useOverlayProvider = () => {
    return React.useContext(OverlayProviderInternalContext);
}

