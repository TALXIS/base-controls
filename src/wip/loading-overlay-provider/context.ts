import React from "react";
import { useOverlayProvider } from "../overlay-provider";
import { ILoadingOverlayProviderComponents } from "./components";


export const LoadingOverlayProviderComponentsContext = React.createContext<ILoadingOverlayProviderComponents>(null as any);

export const useLoadingOverlayProviderComponents = () => {
    return React.useContext(LoadingOverlayProviderComponentsContext);
}

export const useLoadingOverlayProvider = () => {
    return useOverlayProvider();
}