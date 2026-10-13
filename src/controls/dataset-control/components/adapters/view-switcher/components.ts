import { IErrorMessageBarComponents } from "@ui/error-message-bar";
import { ILoadingBoundaryComponents } from "@ui/loading-boundary";
import type { IViewSwitcherUiComponents } from "../../ui";

/** Replacements for the view switcher's slots, and for the pieces inside it by name. */
export interface IViewSwitcherComponents extends Partial<IViewSwitcherUiComponents> {
    /** Its container is a shimmer the size of the button by default. */
    loadingBoundary?: Partial<ILoadingBoundaryComponents>;
    /** How a failed view load looks. */
    errorMessage?: Partial<IErrorMessageBarComponents>;
}
