import React from "react";

export interface ILoadingOverlayContext {
    toggle: (options: {isVisible: boolean; message?: string}) => void;
    isVisible: boolean;
    message?: string;
}

export const LoadingOverlayInternalContext = React.createContext<ILoadingOverlayContext>(null as any);

export const useLoadingOverlay = () => {
    return React.useContext(LoadingOverlayInternalContext);
}