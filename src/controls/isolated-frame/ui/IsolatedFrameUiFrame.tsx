import { forwardRef, useMemo } from "react";
import { getIsolatedFrameStyles } from "./styles";

export interface IIsolatedFrameUiProps {
    /** Put on the iframe, which fills its parent by default. */
    className?: string;
    /** The frame's accessible name. */
    title?: string;
}

/** The iframe an isolated component is drawn in. */
export const IsolatedFrameUi = forwardRef<HTMLIFrameElement, IIsolatedFrameUiProps>((props, ref) => {
    const styles = useMemo(() => getIsolatedFrameStyles(), []);
    return <iframe ref={ref} title={props.title} className={props.className ? `${styles.frame} ${props.className}` : styles.frame} />;
});
IsolatedFrameUi.displayName = 'IsolatedFrameUi';
