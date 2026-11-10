import type { IRuntimeHostComponents } from "@controls/runtime-host";
import type { IDatasetControlUiContainerComponents, IDatasetControlUiSkeletonComponents } from "../../ui";

/** Replacements for what the host and the root draw. */
export interface IDatasetControlComponents extends Partial<Omit<IRuntimeHostComponents, 'placeholder'>>, Partial<IDatasetControlUiContainerComponents> {
    /** What stands in for the parts while the provider loads. */
    skeleton?: Partial<IDatasetControlUiSkeletonComponents>;
}
