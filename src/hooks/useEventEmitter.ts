import { IEventEmitter } from "@talxis/client-libraries";
import { useCallback, useEffect, useRef } from "react";

export const useEventEmitter = <T extends { [K in keyof T]: (...args: any[]) => any }>(emitter: IEventEmitter<T>, event: keyof T, callback: T[keyof T]) => {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const memoizedCallback = useCallback((...args) => {
        callbackRef.current(...args);
    }, []);

    useEffect(() => {
        emitter.addEventListener(event, memoizedCallback as T[keyof T]);
        return () => {
            emitter.removeEventListener(event, memoizedCallback as T[keyof T]);
        };
    }, []);
};