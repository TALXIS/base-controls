import { useEffect, useState, useCallback } from "react";
import { useFormInstance } from "./useFormInstance";

/**
 * Subscribes to overall form validity. Returns `isValid` (current cached value)
 * and a `validate` function that re-runs all known field validators and
 * returns the new overall validity.
 */
export function useFormValidation(): {
    isValid: boolean;
    validate: () => boolean;
} {
    const form = useFormInstance();
    const [isValid, setIsValid] = useState<boolean>(() => form.isFormValid());

    useEffect(() => {
        setIsValid(form.isFormValid());
        const unsub = form.subscribeFormValidation(() => {
            setIsValid(form.isFormValid());
        });
        return unsub;
    }, [form]);

    const validate = useCallback(() => {
        const ok = form.validateForm();
        setIsValid(ok);
        return ok;
    }, [form]);

    return { isValid, validate };
}
