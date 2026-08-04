import { ResizeObserverManager } from '@talxis/client-libraries';
import React, { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Custom hook allowing you to use global ResizeObserver instance for tracking and reacting to changes in element dimensions.
 *
 * @param {(entry: ResizeObserverEntry) => void} callback - method that will be triggered when the provided element changes dimesions
 * @param {number} [delay=0] - number of ms used for callback debouncing, increase if your callback get's triggered too rapidly
 * @returns {void, delay?: number) => any} - method used for registering the observable element.
 */
export const useResizeObserver = (
    callback: (entry: ResizeObserverEntry) => void,
    delay: number = 0
) => {
    const debouncedCallback = useDebouncedCallback(callback, delay);
    const callbackRef = React.useRef(debouncedCallback);
    const elementRef = React.useRef<Element | null>(null);

    const observeCallback = useCallback((entry: ResizeObserverEntry) => {
        if (callbackRef.current) {
            callbackRef.current(entry);
        }
    }, []);

    const observe = React.useCallback((element: Element) => {
        elementRef.current = element;
        ResizeObserverManager.observe(element, observeCallback);
    }, []);

    React.useEffect(() => {
        return () => {
            if (elementRef.current) {
                ResizeObserverManager.unobserve(elementRef.current, observeCallback);
            }
        };
    }, []);

    return observe;
};
