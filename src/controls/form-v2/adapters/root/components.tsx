import type { IRuntimeHostComponents } from "@controls/runtime-host";
import type { IFormV2UiSkeletonComponents } from "../../ui";

/** Replacements for what the host and the root draw. */
export interface IFormV2Components extends Partial<Omit<IRuntimeHostComponents, 'placeholder'>> {
    /** What stands in for the parts while the record loads. */
    skeleton?: Partial<IFormV2UiSkeletonComponents>;
}
