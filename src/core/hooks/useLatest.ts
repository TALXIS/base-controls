import { MutableRefObject, useRef } from "react";

/** A ref whose `current` is the value from the latest render, for callbacks created once. */
export const useLatest = <T,>(value: T): Readonly<MutableRefObject<T>> => {
    const ref = useRef(value);
    ref.current = value;
    return ref;
};
