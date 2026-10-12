import { ILoadingBoundaryComponents } from "@ui/loading-boundary";
import { ISkeletonUiComponents } from "../../ui";

/** Replacements for the skeleton's slots, and for the pieces inside it by name. */
export interface ISkeletonComponents extends Partial<ISkeletonUiComponents> {
    /** Its container is the skeleton by default. */
    loadingBoundary?: Partial<ILoadingBoundaryComponents>;
}
