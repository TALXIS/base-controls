import { IErrorMessageBarComponents } from "@ui/error-message-bar";
import type { ILoadingOverlayComponents } from "@ui/loading";
import type { IContainerUiComponents, ISkeletonUiComponents } from "../../ui";

/** Replacements for the root's slots, and for the pieces inside it by name. */
export interface IDatasetControlComponents extends Partial<IContainerUiComponents> {
    /** Drawn in place of the parts when loading or drawing them failed. */
    errorMessage?: Partial<IErrorMessageBarComponents>;
    /** What stands in for the parts while the provider loads. */
    skeleton?: Partial<ISkeletonUiComponents>;
    /** Replacements for the overlay shown while the control is set loading. */
    loadingOverlay?: Partial<ILoadingOverlayComponents>;
}
