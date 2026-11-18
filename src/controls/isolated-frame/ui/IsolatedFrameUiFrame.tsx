import { useEffect, useMemo, useState } from "react";
import { getIsolatedFrameUiFrameStyles } from "./styles";
import { useIframeContentHeight } from "./useIframeContentHeight";

export interface IIsolatedFrameUiFrameProps {
    /** Put on the iframe, which is as wide as its parent and as tall as what it draws. */
    className?: string;
    /** The frame's accessible name. */
    title?: string;
    /** Called once with the iframe as it mounts. */
    onLoad?: (iframe: HTMLIFrameElement) => void;
}

/** The iframe an isolated component is drawn in. */
export const IsolatedFrameUiFrame = (props: IIsolatedFrameUiFrameProps) => {
    const styles = useMemo(() => getIsolatedFrameUiFrameStyles(), []);
    const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
    useIframeContentHeight(iframe);

    useEffect(() => {
        if (iframe) {
            props.onLoad?.(iframe);
        }
    }, [iframe]);

    return <iframe ref={setIframe} title={props.title} className={props.className ? `${styles.frame} ${props.className}` : styles.frame} />;
};
