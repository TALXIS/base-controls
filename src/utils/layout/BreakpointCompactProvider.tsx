import { useRef, useState } from "react";
import { ScreenWidthMaxSmall } from "@fluentui/react";
import { CompactContext } from "./context";
import { useResizeEffect } from "./useResizeEffect";

/** The default `maxCompactWidth`: the widest phone screen, in pixels. */
export const DEFAULT_MAX_COMPACT_WIDTH = ScreenWidthMaxSmall;

export interface IBreakpointCompactProviderProps extends React.HTMLAttributes<HTMLDivElement> {
    /** The widest box, in pixels, that still counts as compact. Defaults to {@link DEFAULT_MAX_COMPACT_WIDTH}. */
    maxCompactWidth?: number;
}

/** A box that tells everything inside it to draw compact while it is at most `maxCompactWidth` wide. */
export const BreakpointCompactProvider = (props: IBreakpointCompactProviderProps) => {
    const { maxCompactWidth = DEFAULT_MAX_COMPACT_WIDTH, children, ...divProps } = props;
    const [isCompact, setIsCompact] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useResizeEffect(elementRef, () => {
        if (elementRef.current) {
            setIsCompact(elementRef.current.offsetWidth <= maxCompactWidth);
        }
    });

    return <div {...divProps} ref={elementRef}>
        <CompactContext.Provider value={isCompact}>{children}</CompactContext.Provider>
    </div>;
};
