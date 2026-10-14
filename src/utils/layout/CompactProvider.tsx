import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ScreenWidthMaxSmall } from "@fluentui/react";
import { useResizeObserver } from "@legacy";
import { CompactContext } from "./context";

/** The default breakpoint: the widest phone screen, in pixels. */
export const COMPACT_BREAKPOINT = ScreenWidthMaxSmall;

export interface ICompactProviderProps extends React.HTMLAttributes<HTMLDivElement> {
    /** The widest box, in pixels, that still counts as compact. Defaults to {@link COMPACT_BREAKPOINT}. */
    breakpoint?: number;
}

/** A box that tells everything inside it whether it is narrow enough to draw in compact mode. */
export const CompactProvider = (props: ICompactProviderProps) => {
    const { breakpoint = COMPACT_BREAKPOINT, children, ...divProps } = props;
    const [isCompact, setIsCompact] = useState(false);
    const elementRef = useRef<HTMLDivElement | null>(null);
    //the observer keeps the first callback it is given
    const breakpointRef = useRef(breakpoint);
    breakpointRef.current = breakpoint;

    const measure = () => {
        if (elementRef.current) {
            setIsCompact(elementRef.current.offsetWidth <= breakpointRef.current);
        }
    };

    const observe = useResizeObserver(measure);

    useLayoutEffect(measure, [breakpoint]);

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
