import { forwardRef, useMemo } from "react";
import { getIsolatedFrameUiFrameStyles } from "./styles";

export interface IIsolatedFrameUiFrameProps {
    /** Put on the iframe, which fills its parent by default. */
    className?: string;
    /** The frame's accessible name. */
    title?: string;
}

/** The iframe an isolated component is drawn in. */
export const IsolatedFrameUiFrame = forwardRef<HTMLIFrameElement, IIsolatedFrameUiFrameProps>((props, ref) => {
    const styles = useMemo(() => getIsolatedFrameUiFrameStyles(), []);
    return <iframe ref={ref} title={props.title} className={props.className ? `${styles.frame} ${props.className}` : styles.frame} />;
});
IsolatedFrameUiFrame.displayName = 'IsolatedFrameUiFrame';
