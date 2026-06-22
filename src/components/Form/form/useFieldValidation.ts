import { useEffect, useState, useCallback } from "react";
import { useFormInstance } from "./useFormInstance";
import { IFieldValidationResult } from "../interfaces";

/**
 * Subscribes to the validation state for a single column. Returns the current
 * cached validation result and a `validate` function that forces a fresh run.
 *
 * The result updates automatically when the field's value changes (after the
 * first `validate()` call) or when another caller invokes `validateField`
 * / `validateForm` on the surrounding `FormModel`.
 */
export function useFieldValidation(name: string): {
    result: IFieldValidationResult;
    validate: () => IFieldValidationResult;
} {
    const form = useFormInstance();
    const [result, setResult] = useState<IFieldValidationResult>(() => form.getFieldError(name));

    useEffect(() => {
        setResult(form.getFieldError(name));
        const unsub = form.subscribeFieldValidation(name, () => {
            setResult(form.getFieldError(name));
        });
        return unsub;
    }, [form, name]);

    const validate = useCallback(() => {
        const r = form.validateField(name);
        setResult(r);
        return r;
    }, [form, name]);

    return { result, validate };
}
