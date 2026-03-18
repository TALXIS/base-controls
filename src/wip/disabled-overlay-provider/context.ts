import { useLoadingOverlay } from "../loading-overlay-provider";

export interface IInternalDisabledOverlayProviderContext {
    toggle: (options: { isVisible: boolean; message?: string }) => void;
    message?: string;
}

export const useDisabledOverlay = (): IInternalDisabledOverlayProviderContext => {
    return useLoadingOverlay();
}