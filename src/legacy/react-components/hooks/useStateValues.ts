import { cloneDeep } from "lodash";
import { useRef } from "react";
import deepEqual from 'fast-deep-equal';

/**
 * Same as `useControlledStateValues`, the only difference is that state changes won't automatically get saved. You can use the method returned to access the newly built state object.
 */
export const useStateValues = <T>(cachedValues: T, defaultValues: T = {} as T,): [
    React.MutableRefObject<T>,
    () => T,
    (defaultValues: T) => void,
] => {
    const initialStateValuesRef = useRef<T | null>(null);

    const setInitialStateValues = (defaultValues: T): T => {
        const controlStateValues = {
            ...defaultValues,
            ...cachedValues,
        };
        initialStateValuesRef.current = cloneDeep(controlStateValues);
        return controlStateValues;
    };
    const stateValuesRef = useRef<T | null>((() => {
        if (initialStateValuesRef.current) {
            return null;
        }
        return setInitialStateValues(defaultValues);
    })());

    const setDefaultStateValues = (awaitedDefaultValues: T) => {
        stateValuesRef.current = setInitialStateValues(awaitedDefaultValues);
    };

    const getNewStateValues = (): T => {
        const newStateValues = {} as T;
        //initial and statevalues will never be null
        for (const [key, item] of Object.entries(initialStateValuesRef.current!)) {
            if (!deepEqual(item, stateValuesRef.current![key as keyof T])) {
                newStateValues[key as keyof T] = stateValuesRef.current![key as keyof T];
            }
        }
        return {
            ...cachedValues,
            ...newStateValues
        };
    };
    return [stateValuesRef as React.MutableRefObject<T>, getNewStateValues, setDefaultStateValues];
};
