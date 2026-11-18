import { useEffect } from "react";
import { useResizeObserver } from "@core";

/** Keeps the iframe as tall as the document it shows, which an iframe never does on its own. */
export const useIframeContentHeight = (iframe: HTMLIFrameElement | null): void => {
    
    const observeBody = useResizeObserver(entry => {
        const body = entry.target as HTMLElement;
        const frame = body.ownerDocument.defaultView?.frameElement as HTMLIFrameElement | null;
        if (frame) {
            frame.style.height = `${body.offsetHeight}px`;
        }
    });

    useEffect(() => {
        if (!iframe) {
            return;
        }
        const listeners = new AbortController();
        //each load is a new document to follow
        const observeDocument = () => {
            const body = iframe.contentDocument?.body;
            if (body) {
                observeBody(body);
            }
        };
        iframe.addEventListener('load', observeDocument, { signal: listeners.signal });
        observeDocument();
        return () => listeners.abort();
    }, [iframe]);
};
