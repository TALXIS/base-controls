import type { IErrorMessageBarComponents } from "@ui/error-message-bar";

/** Replacements for what the host draws itself. */
export interface IRuntimeHostComponents {
    /** How a failed init looks. */
    errorMessage: Partial<IErrorMessageBarComponents>;
}
