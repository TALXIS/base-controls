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

/** A box that tells everything inside it to draw compact once it grows taller than one line of compact content, until it gets wider or loses an item. */
export const WrapCompactProvider = (props: IWrapCompactProviderProps) => {
    const { children, ...divProps } = props;
    //starts compact, so the first layout measures how tall one line is
    const [isCompact, setIsCompact] = useState(true);
    const elementRef = useRef<HTMLDivElement>(null);
    const lineHeightRef = useRef(0);
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
        const height = element.offsetHeight;
        if (!isCompact) {
            //full-size parts are as tall as compact ones, so a taller box has wrapped
            if (height > lineHeightRef.current) {
                wrappedAtWidthRef.current = width;
                setIsCompact(true);
            }
            return;
        }
        lineHeightRef.current = height;
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
