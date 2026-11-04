import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from "react";
import { CompactContext } from "./context";
import { useResizeEffect } from "./useResizeEffect";

export type IWrapCompactProviderProps = React.HTMLAttributes<HTMLDivElement>;

const CompactItemRemovedContext = createContext<(() => void) | undefined>(undefined);

/** Marks the component as an item of the nearest {@link WrapCompactProvider}; removing one lets the rest try full size again. */
export const useCompactItem = () => {
    const onItemRemoved = useContext(CompactItemRemovedContext);
    useLayoutEffect(() => () => onItemRemoved?.(), [onItemRemoved]);
};

//the boxes the box lays out in its lines, looking through `display: contents` wrappers
const getLineItems = (element: Element): Element[] => [...element.children].flatMap(child => {
    const { display, position } = getComputedStyle(child);
    if (display === 'contents') {
        return getLineItems(child);
    }
    return display === 'none' || position === 'absolute' || position === 'fixed' ? [] : [child];
});

const isWrapped = (element: Element): boolean => {
    const rects = getLineItems(element).map(item => item.getBoundingClientRect()).filter(rect => rect.height > 0);
    const firstLineBottom = Math.min(...rects.map(rect => rect.bottom));
    return rects.some(rect => rect.top >= firstLineBottom);
};

/** A box that tells everything inside it to draw compact once its parts wrap onto a second line, until it gets wider or loses an item. */
export const WrapCompactProvider = (props: IWrapCompactProviderProps) => {
    const { children, ...divProps } = props;
    const [isCompact, setIsCompact] = useState(true);
    const elementRef = useRef<HTMLDivElement>(null);
    //the width the box had when its content wrapped; compact holds until the box is wider
    const wrappedAtWidthRef = useRef<number>();

    const onItemRemoved = useCallback(() => {
        wrappedAtWidthRef.current = undefined;
        setIsCompact(false);
    }, []);

    useResizeEffect(elementRef, () => {
        const element = elementRef.current;
        if (!element) {
            return;
        }
        const width = element.offsetWidth;
        if (!isCompact) {
            if (isWrapped(element)) {
                wrappedAtWidthRef.current = width;
                setIsCompact(true);
            }
            return;
        }
        if (wrappedAtWidthRef.current !== undefined && width > wrappedAtWidthRef.current) {
            wrappedAtWidthRef.current = undefined;
        }
        if (wrappedAtWidthRef.current === undefined) {
            setIsCompact(false);
        }
    });

    return <div {...divProps} ref={elementRef}>
        <CompactItemRemovedContext.Provider value={onItemRemoved}>
            <CompactContext.Provider value={isCompact}>{children}</CompactContext.Provider>
        </CompactItemRemovedContext.Provider>
    </div>;
};
