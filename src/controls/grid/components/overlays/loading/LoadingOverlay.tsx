import { useGridService } from "@controls/grid/useGridService";
import { useGridComponents } from "@controls/grid/context";

/** What the grid shows while it loads, with the provider's loading message if it has one. */
export const LoadingOverlay = () => {
    const provider = useGridService('provider');
    const components = useGridComponents();

    return components.onRenderLoadingOverlay({ message: provider.getLoadingMessage() || undefined });
};
