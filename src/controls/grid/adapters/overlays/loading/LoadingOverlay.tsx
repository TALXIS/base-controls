import { useGridServiceInternal } from "../../../useGridService";
import { useGridComponents } from "../../../context";
import { OverlayUi } from "../../../ui/overlays";

/** What the grid shows while it loads, with the provider's loading message if it has one. */
export const LoadingOverlay = () => {
    const provider = useGridServiceInternal('provider');
    const components = useGridComponents();

    return <OverlayUi.Loading message={provider.getLoadingMessage() || undefined} components={components.overlays?.loading} />;
};
