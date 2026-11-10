import type { IErrorMessageBarComponents } from "@ui/error-message-bar";
import type { ILoadingBoundaryComponents } from "@ui/loading-boundary";
import type { ILoadingOverlayComponents } from "@ui/loading";
import type { IRuntimeExecuteErrorComponents } from "./adapters/execute-error";
import type { IRuntimeHostUiContainerComponents } from "./ui";

/** Replacements for what the host draws itself. */
export interface IRuntimeHostComponents {
    /** The box the host draws everything in. */
    container: Partial<IRuntimeHostUiContainerComponents>;
    /** What stands in for the runtime until it is ready. */
    placeholder: Partial<ILoadingBoundaryComponents>;
    /** What stands in for the runtime when its init failed or its UI threw. */
    mountError: Partial<IErrorMessageBarComponents>;
    /** What covers the ready runtime while its loading is shown. */
    loadingOverlay: Partial<ILoadingOverlayComponents>;
    /** How a failure of `execute` is shown. */
    executeError: Partial<IRuntimeExecuteErrorComponents>;
}
