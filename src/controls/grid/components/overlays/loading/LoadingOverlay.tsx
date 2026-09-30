import { useGridService } from "../../../useGridService";
import { useGridComponents } from "../../../context";
import { OverlayUi } from "../ui";

/** What the grid shows while it loads, with the provider's loading message if it has one. */
export const LoadingOverlay = () => {
    const provider = useGridService('provider');
    const components = useGridComponents();

    return <OverlayUi.Loading message={provider.getLoadingMessage() || undefined} components={components.loadingOverlay} />;
};
