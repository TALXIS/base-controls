import type { IErrorMessageBarComponents } from "@ui/error-message-bar";
import type { ILoadingBoundaryComponents } from "@ui/loading-boundary";
import type { ILoadingOverlayComponents } from "@ui/loading";
import type { IMapUiContainerComponents } from "./ui";

/** Replacements for the map's slots; the adapter has slots of its own. */
export interface IMapComponents extends Partial<IMapUiContainerComponents> {
    /** What shows until the map is loaded. */
    loading?: Partial<ILoadingBoundaryComponents>;
    /** How a failed load looks. */
    errorMessage?: Partial<IErrorMessageBarComponents>;
    /** What covers the map while its provider loads. */
    loadingOverlay?: Partial<ILoadingOverlayComponents>;
}
