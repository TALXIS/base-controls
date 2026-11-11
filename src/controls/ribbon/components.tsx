import type { IRuntimeHostComponents } from "@controls/runtime-host";
import { IRibbonUiShimmerComponents, IRibbonUiCommandBarComponents } from "./ui";

/** Replacements for what the ribbon and its host draw. */
export interface IRibbonComponents extends Partial<Omit<IRuntimeHostComponents, 'placeholder'>> {
    /** The commands' bar. */
    commandBar?: Partial<IRibbonUiCommandBarComponents>;
    /** The shimmer that stands in for the commands until the first load finishes. */
    shimmer?: Partial<IRibbonUiShimmerComponents>;
}
