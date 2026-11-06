import { IErrorMessageBarComponents } from "@ui/error-message-bar";
import { IRibbonShimmerUiComponents, IRibbonUiComponents } from "./ui";

/** Replacements for the ribbon's slots, and for the pieces inside it by name. */
export interface IRibbonComponents extends Partial<IRibbonUiComponents> {
    /** The shimmer that stands in for the commands until the first load finishes. */
    shimmer?: Partial<IRibbonShimmerUiComponents>;
    /** How a failed load of the commands looks. */
    errorMessage?: Partial<IErrorMessageBarComponents>;
}
