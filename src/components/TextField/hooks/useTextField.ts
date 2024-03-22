import { useEffect, useRef, useState } from "react";
import { ITextField } from "../interfaces";

export const useTextField = (props: ITextField, ref: React.RefObject<HTMLDivElement>): [number | undefined] => {
    const getInitialHeight = () => {
        if (props.context.mode.allocatedHeight) {
            return props.context.mode.allocatedHeight;
        }
        if (props.bindings.IsMultiLine?.raw) {
            return 80;
        }
        return undefined;
    };

    const hasBeenResizedRef = useRef<boolean>(false);
    const [height, setHeight] = useState<number | undefined>(getInitialHeight());
    const firstRenderRef = useRef<boolean>(true);
    
    useEffect(() => {
        if (!props.bindings.IsMultiLine?.raw) {
            return;
        }
        const resizeObserver = new ResizeObserver(() => {
            if (firstRenderRef.current || hasBeenResizedRef.current) {
                firstRenderRef.current = false;
                return;
            }
            hasBeenResizedRef.current = true;
            console.log('running');
            setHeight(undefined)
        });
        const textarea = ref.current?.querySelector('textarea') as HTMLTextAreaElement;
        if (height) {
            textarea.setAttribute('style', `height: ${height}px`)
        }
        resizeObserver.observe(textarea);

        return () => {
            resizeObserver.disconnect();
        }
    }, []);
    return [height];
}