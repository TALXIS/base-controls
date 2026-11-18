import { useEffect } from "react";
import { useResizeObserver } from "@core";

/** Keeps the iframe as tall as the document it shows, unless it has a fixed `height`. */
export const useIframeHeight = (iframe: HTMLIFrameElement | null, height?: string): void => {
    const observeBody = useResizeObserver(entry => {
        const body = entry.target as HTMLElement;
        const frame = body.ownerDocument.defaultView?.frameElement as HTMLIFrameElement | null;
        if (frame) {
            frame.style.height = `${body.offsetHeight}px`;
        }
    });

    useEffect(() => {
        if (!iframe || height) {
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
