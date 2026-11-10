import { useEffect } from "react";
import { ErrorHelper } from "@core";
import { usePcfContext } from "@pcf";

export interface IRuntimeHostUiErrorDialogProps {
    title: string;
    /** What the operation threw. */
    error: unknown;
    /** Takes the error away, and the next one is shown. */
    onDismiss: () => void;
}

/** Opens the platform's error dialog and dismisses the error once it closes. */
export const RuntimeHostUiErrorDialog = (props: IRuntimeHostUiErrorDialogProps) => {
    //the one UI that reads the PCF context: its look is the platform's own dialog
    const pcfContext = usePcfContext();
    useEffect(() => {
        const open = async () => {
            await pcfContext.navigation.openErrorDialog({ message: props.title, details: ErrorHelper.getMessageFromError(props.error) });
            props.onDismiss();
        };
        open();
    }, []);
    return null;
};
