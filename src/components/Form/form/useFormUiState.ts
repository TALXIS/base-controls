import { useEffect, useReducer } from "react";
import { useFormInstance } from "./useFormInstance";

/**
 * Subscribes to UI-state changes on the FormModel (visibility, disabled, label overrides).
 * Forces a re-render whenever Xrm mutations (setVisible, setDisabled, setLabel, etc.) occur.
 */
export const useFormUiState = (): void => {
    const form = useFormInstance();
    const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
    useEffect(() => form.subscribeUiState(forceUpdate), [form]);
};
