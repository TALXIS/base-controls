import { useRef, useState } from "react";
import { CompactContext } from "./context";
import { useResizeEffect } from "./useResizeEffect";

export type IWrapCompactProviderProps = React.HTMLAttributes<HTMLDivElement>;

//the items laid out in the box's own lines; a display: contents wrapper lays out what it holds instead
const getLineItems = (element: Element): Element[] => [...element.children].flatMap(child => {
    const style = getComputedStyle(child);
    if (style.display === 'contents') {
        return getLineItems(child);
    }
    //an item given a line of its own, such as a title, is not a sign of running out of room
    return style.display === 'none' || style.flexBasis === '100%' ? [] : [child];
});

const isWrapping = (element: HTMLElement) => {
    const rects = getLineItems(element).map(item => item.getBoundingClientRect()).filter(rect => rect.width > 0);
    return rects.some(rect => rects.some(other => rect.top >= other.bottom));
};

/** A box that tells everything inside it to draw compact once it no longer fits on one line, until the box gets wider than it was then. */
export const WrapCompactProvider = (props: IWrapCompactProviderProps) => {
    const { children, ...divProps } = props;
    const [isCompact, setIsCompact] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    //the width the box had when its content wrapped; compact holds until the box is wider
    const wrappedAtWidthRef = useRef<number>();

    useResizeEffect(elementRef, () => {
        const element = elementRef.current;
        if (!element) {
            return;
        }
        const width = element.offsetWidth;
        if (wrappedAtWidthRef.current !== undefined && width > wrappedAtWidthRef.current) {
            wrappedAtWidthRef.current = undefined;
        }
        //only content drawn at full size tells whether full size fits
        if (!isCompact && isWrapping(element)) {
            wrappedAtWidthRef.current = width;
        }
        const nextIsCompact = wrappedAtWidthRef.current !== undefined;
        if (nextIsCompact !== isCompact) {
            setIsCompact(nextIsCompact);
        }
    });

    return <div {...divProps} ref={elementRef}>
        <CompactContext.Provider value={isCompact}>{children}</CompactContext.Provider>
    </div>;
};
