import { IEventEmitter } from "@talxis/client-libraries";
import { useCallback, useEffect, useRef } from "react";

export const useEventEmitter = <T extends { [K in keyof T]: (...args: any[]) => any }>(emitter: IEventEmitter<T> | null | undefined, event: keyof T | (keyof T)[], callback: T[keyof T]) => {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const memoizedCallback = useCallback((...args) => {
        callbackRef.current(...args);
    }, []);

    const events = Array.isArray(event) ? event : [event];
    //callers pass inline array literals, so the effect keys off the names rather than the array identity
    const eventKey = events.map(String).join('|');

    useEffect(() => {
        if (!emitter) return;
        for (const name of events) {
            emitter.addEventListener(name, memoizedCallback as T[keyof T]);
        }
        return () => {
            for (const name of events) {
                emitter.removeEventListener(name, memoizedCallback as T[keyof T]);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [emitter, eventKey, memoizedCallback]);
};
