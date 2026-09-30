import { useCallback, useRef, useState } from "react";
import { useResizeObserver } from "@legacy";

/** The most lines a value wraps onto, however tall its cell. */
const MAX_LINES = 6;

/** How many lines of a wrapped value fit where it is drawn, and the ref that measures it. */
export const useLineClamp = (isMultiline: boolean) => {
    const [lines, setLines] = useState(MAX_LINES);
    //a ref: the observer keeps the callback it was first given
    const elementRef = useRef<HTMLElement | null>(null);

    const measure = useCallback((text: HTMLElement) => {
        const container = text.parentElement;
        if (!container) {
            return;
        }
        const style = getComputedStyle(text);
        //`normal` is what the font asks for, about 1.2 of its size
        const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
        const fitting = Math.floor(container.clientHeight / lineHeight);
        setLines(Math.max(1, Math.min(MAX_LINES, fitting)));
    }, []);

    const observe = useResizeObserver(() => elementRef.current && measure(elementRef.current));

    const ref = useCallback((text: HTMLElement | null) => {
        elementRef.current = text;
        if (!text || !isMultiline) {
            return;
        }
        measure(text);
        if (text.parentElement) {
            observe(text.parentElement);
        }
    }, [isMultiline]);

    return { ref, lines };
};
