import { useEffect, useReducer } from "react";
import { IAttributeConfiguration } from "../interfaces";
import { useFormInstance } from "./useFormInstance";

/**
 * Returns resolved metadata for a single field using the surrounding FormModel.
 * When metadata cannot be resolved, returns `undefined` instead of throwing.
 *
 * The result tracks runtime metadata overrides (required level, options, etc.)
 * and refreshes when the form's UI/meta state changes.
 */
export const useFieldMetadata = (name: string): IAttributeConfiguration | undefined => {
    const form = useFormInstance();
    const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

    useEffect(() => form.subscribeUiState(forceUpdate), [form]);

    try {
        return form.getAttributeConfiguration(name);
    } catch {
        return undefined;
    }
};
