import type { IErrorMessageBarComponents } from "@ui/error-message-bar";
import type { ILoadingBoundaryComponents } from "@ui/loading-boundary";
import type { IMapUiContainerComponents } from "./ui";

/** Replacements for the map's slots; the adapter has slots of its own. */
export interface IMapComponents {
    /** The map's box, which the runtime is drawn in. */
    container?: Partial<IMapUiContainerComponents>;
    /** What shows until the map is loaded. */
    loading?: Partial<ILoadingBoundaryComponents>;
    /** How a failed load looks. */
    errorMessage?: Partial<IErrorMessageBarComponents>;
}
