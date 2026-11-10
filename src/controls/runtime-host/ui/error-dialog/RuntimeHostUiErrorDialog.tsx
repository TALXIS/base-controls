import { useEffect } from "react";
import { ErrorHelper } from "@core";
import { usePcfContext } from "@pcf";

/** One failure of `execute`, waiting to be dismissed. */
export interface IRuntimeExecuteFailure {
    title: string;
    /** What the operation threw. */
    error: unknown;
}

export interface IRuntimeHostUiErrorDialogProps {
    /** Oldest first. */
    failures: IRuntimeExecuteFailure[];
    onDismiss: (failure: IRuntimeExecuteFailure) => void;
}

/** Opens the platform's error dialog for the oldest failure, and the next once it closes. */
export const RuntimeHostUiErrorDialog = (props: IRuntimeHostUiErrorDialogProps) => {
    //the one UI that reads the PCF context: its look is the platform's own dialog
    const pcfContext = usePcfContext();
    const [failure] = props.failures;
    useEffect(() => {
        if (!failure) {
            return;
        }
        const open = async () => {
            await pcfContext.navigation.openErrorDialog({ message: failure.title, details: ErrorHelper.getMessageFromError(failure.error) });
            props.onDismiss(failure);
        };
        open();
    }, [failure]);
    return null;
};
