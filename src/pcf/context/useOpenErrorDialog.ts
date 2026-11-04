import { useCallback } from "react";
import { usePcfContext } from "./context";

/** Shows an error's title and details in the PCF error dialog. */
export const useOpenErrorDialog = () => {
    const context = usePcfContext();
    return useCallback((error: { title: string; details: string }) => context.navigation.openErrorDialog({ message: error.title, details: error.details }), [context]);
};
