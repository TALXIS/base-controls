import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ScreenWidthMaxSmall } from "@fluentui/react";
import { useResizeObserver } from "@legacy";
import { CompactContext } from "./context";

/** The default `maxCompactWidth`: the widest phone screen, in pixels. */
export const DEFAULT_MAX_COMPACT_WIDTH = ScreenWidthMaxSmall;

export interface ICompactProviderProps extends React.HTMLAttributes<HTMLDivElement> {
    /** The widest box, in pixels, that still counts as compact. Defaults to {@link DEFAULT_MAX_COMPACT_WIDTH}. */
    maxCompactWidth?: number;
}

/** A box that tells everything inside it whether it is narrow enough to draw in compact mode. */
export const CompactProvider = (props: ICompactProviderProps) => {
    const { maxCompactWidth = DEFAULT_MAX_COMPACT_WIDTH, children, ...divProps } = props;
    const [isCompact, setIsCompact] = useState(false);
    const elementRef = useRef<HTMLDivElement | null>(null);
    //the observer keeps the first callback it is given
    const maxCompactWidthRef = useRef(maxCompactWidth);
    maxCompactWidthRef.current = maxCompactWidth;

    const measure = () => {
        if (elementRef.current) {
            setIsCompact(elementRef.current.offsetWidth <= maxCompactWidthRef.current);
        }
    };

    const observe = useResizeObserver(measure);

    useLayoutEffect(measure, [maxCompactWidth]);

    const setElement = useCallback((element: HTMLDivElement | null) => {
        elementRef.current = element;
        if (element) {
            observe(element);
        }
    }, []);

    return <div {...divProps} ref={setElement}>
        <CompactContext.Provider value={isCompact}>{children}</CompactContext.Provider>
    </div>;
};
