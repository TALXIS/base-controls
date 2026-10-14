import { RefObject, useLayoutEffect, useRef } from "react";

//runs after every render and on every resize, before paint, so a layout the effect reacts to is never drawn
export const useResizeEffect = (elementRef: RefObject<HTMLElement>, effect: () => void) => {
    const effectRef = useRef(effect);
    effectRef.current = effect;

    useLayoutEffect(() => {
        effectRef.current();
    });

    useLayoutEffect(() => {
        if (!elementRef.current) {
            return;
        }
        const observer = new ResizeObserver(() => effectRef.current());
        observer.observe(elementRef.current);
        return () => observer.disconnect();
    }, []);
};
