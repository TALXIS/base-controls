import React from "react";

export interface ILoadingOverlayContext {
    toggle: (options: {isLoading: boolean; message?: string}) => void
}

export const LoadingOverlayContext = React.createContext<ILoadingOverlayContext>(null as any);

export const useLoadingOverlay = () => {
    return React.useContext(LoadingOverlayContext);
}