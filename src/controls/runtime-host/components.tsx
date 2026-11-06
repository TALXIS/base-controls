import type { IErrorMessageBarComponents } from "@ui/error-message-bar";
import type { ILoadingBoundaryComponents } from "@ui/loading-boundary";

/** Replacements for what the host draws itself. */
export interface IRuntimeHostComponents {
    /** How a failed init looks. */
    errorMessage: Partial<IErrorMessageBarComponents>;
    /** What shows until the runtime is ready. */
    loading: Partial<ILoadingBoundaryComponents>;
}
