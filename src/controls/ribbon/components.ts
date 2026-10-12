import { IErrorMessageBarComponents } from "@ui/error-message-bar";
import { ILoadingBoundaryComponents } from "@ui/loading-boundary";
import { IRibbonUiComponents } from "./ui";

/** Replacements for the ribbon's slots, and for the pieces inside it by name. */
export interface IRibbonComponents extends Partial<IRibbonUiComponents> {
    /** Its container is a shimmer the height of the command bar by default. */
    loadingBoundary?: Partial<ILoadingBoundaryComponents>;
    errorMessage?: Partial<IErrorMessageBarComponents>;
}
