import { useEffect, useRef, useState } from "react";

const HOVER_INTENT_DELAY = 350;

/** Holds a hovered thing back until the pointer rests on it, then follows it, and lets go at once. */
export const useHoverIntent = <T,>(): [T | undefined, (value: T | undefined, isImmediate?: boolean) => void] => {
    const [shown, setShown] = useState<T>();
    const isShownRef = useRef(false);
    const timerRef = useRef<number>();

    const set = (value: T | undefined, isImmediate = false) => {
        window.clearTimeout(timerRef.current);
        if (value === undefined || isImmediate || isShownRef.current) {
            isShownRef.current = value !== undefined;
            setShown(value);
            return;
        }
        timerRef.current = window.setTimeout(() => {
            isShownRef.current = true;
            setShown(value);
        }, HOVER_INTENT_DELAY);
    };

    useEffect(() => () => window.clearTimeout(timerRef.current), []);
    return [shown, set];
};
