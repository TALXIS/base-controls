import { useEffect, useState } from "react";
import { useFormInstance } from "./useFormInstance";

/**
 * Subscribes to the value of a single bound attribute and re-renders the
 * consumer when it changes. Use inside inputs / codeful children.
 *
 * Returns a `[value, setValue]` tuple. `setValue` proxies to the underlying
 * `IRecord` via `FormModel.setValue`, which emits `onFieldValueChanged` and
 * triggers all subscribers of this attribute.
 */
export const useFieldValue = <T = unknown>(name: string): [T | undefined, (v: T) => void] => {
    const form = useFormInstance();
    const [value, setLocal] = useState<T | undefined>(() => form.getValue(name) as T | undefined);

    useEffect(() => {
        // Sync once on mount / name change in case value was set between render and effect.
        setLocal(form.getValue(name) as T | undefined);
        const unsub = form.subscribeFieldValue(name, () => {
            setLocal(form.getValue(name) as T | undefined);
        });
        return unsub;
    }, [form, name]);

    const set = (v: T) => {
        form.setValue(name, v);
    };

    return [value, set];
};
