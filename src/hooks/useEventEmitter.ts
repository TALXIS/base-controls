import { IEventEmitter } from "@talxis/client-libraries";
import { useCallback, useEffect, useRef } from "react";

export const useEventEmitter = <T extends { [K in keyof T]: (...args: any[]) => any }>(emitter: IEventEmitter<T>, event: keyof T | (keyof T)[], callback: T[keyof T]) => {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const memoizedCallback = useCallback((...args) => {
        callbackRef.current(...args);
    }, []);

    useEffect(() => {
        const events = Array.isArray(event) ? event : [event];
        events.map(event => {
            emitter.addEventListener(event, memoizedCallback as T[keyof T]);
        })
        return () => {
            events.map(event => {
                emitter.removeEventListener(event, memoizedCallback as T[keyof T]);
            })
        };
    }, []);
};