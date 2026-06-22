import { useState, useEffect } from "react";
import { useFormInstance } from "./useFormInstance";

/**
 * Returns whether the form has unsaved changes. Delegates to
 * `record.isDirty()` when available; falls back to the model's
 * own local dirty flag (set on every `setValue` call).
 */
export const useFormDirty = (): boolean => {
    const form = useFormInstance();
    const [dirty, setDirty] = useState(() => form.isDirty());

    useEffect(() => {
        setDirty(form.isDirty());
        return form.subscribeFormDirty(() => {
            setDirty(form.isDirty());
        });
    }, [form]);

    return dirty;
};
