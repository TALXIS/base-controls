import { useEffect, useRef, useState } from "react";

export const useTextFieldHeight = (ref: React.RefObject<HTMLDivElement>, initialHeight?: number, isMultiline?: boolean): [number | undefined] => {
    const getInitialHeight = () => {
        if (initialHeight) {
            return initialHeight;
        }
        if (isMultiline) {
            return 80;
        }
        return undefined;
    };

    const hasBeenResizedRef = useRef<boolean>(false);
    const [height, setHeight] = useState<number | undefined>(getInitialHeight());
    const firstRenderRef = useRef<boolean>(true);
    
    useEffect(() => {
        if (!isMultiline) {
            return;
        }
        const resizeObserver = new ResizeObserver(() => {
            if (firstRenderRef.current || hasBeenResizedRef.current) {
                firstRenderRef.current = false;
                return;
            }
            hasBeenResizedRef.current = true;
            setHeight(undefined);
        });
        const textarea = ref.current?.querySelector('textarea') as HTMLTextAreaElement;
        if (height) {
            textarea.setAttribute('style', `height: ${height}px`);
        }
        resizeObserver.observe(textarea);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);
    return [height];
};