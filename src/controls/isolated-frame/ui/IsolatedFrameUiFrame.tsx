import { useEffect, useMemo, useState } from "react";
import { getIsolatedFrameUiFrameStyles } from "./styles";
import { useIframeHeight } from "./useIframeHeight";

export interface IIsolatedFrameUiFrameProps {
    /** Put on the iframe, which is as wide as its parent and as tall as what it draws. */
    className?: string;
    /** A fixed height, such as `400px` or `100%`, which the content fills instead of sizing the iframe. */
    height?: string;
    /** The frame's accessible name. */
    title?: string;
    /** Called once with the iframe as it mounts. */
    onLoad?: (iframe: HTMLIFrameElement) => void;
}

/** The iframe an isolated component is drawn in. */
export const IsolatedFrameUiFrame = (props: IIsolatedFrameUiFrameProps) => {
    const styles = useMemo(() => getIsolatedFrameUiFrameStyles(props.height), [props.height]);
    const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
    useIframeHeight(iframe, props.height);

    useEffect(() => {
        if (iframe) {
            props.onLoad?.(iframe);
        }
    }, [iframe]);

    return <iframe ref={setIframe} title={props.title} className={props.className ? `${styles.frame} ${props.className}` : styles.frame} />;
};
