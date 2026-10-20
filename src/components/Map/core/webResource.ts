/**
 * Resolves a web resource name to a url the browser can load. Returns nothing outside a host that provides
 * `Xrm`, so a control running in Storybook, a test, or a standalone app degrades to whatever it was going
 * to do without the web resource rather than throwing.
 */
export const getMapWebResourceUrl = (webResourceName: string): string | undefined => {
    if (!webResourceName) {
        return undefined;
    }
    try {
        //@ts-ignore - getWebResourceUrl is missing from @types/xrm
        const path = window.Xrm?.Utility?.getGlobalContext?.()?.getWebResourceUrl?.(webResourceName);
        if (typeof path !== 'string' || !path) {
            return undefined;
        }
        return path.startsWith('http') ? path : `${window.location.origin}${path}`;
    } catch (error) {
        console.warn(`Map: could not resolve the web resource "${webResourceName}":`, error);
        return undefined;
    }
};

/** Fetches the text of a web resource - the HTML behind a legend, say. */
export const getMapWebResourceText = async (
    webResourceName: string,
    signal?: AbortSignal
): Promise<string | undefined> => {
    const url = getMapWebResourceUrl(webResourceName);
    if (!url) {
        return undefined;
    }
    try {
        const response = await fetch(url, { signal });
        if (!response.ok) {
            console.warn(`Map: the web resource "${webResourceName}" answered ${response.status}.`);
            return undefined;
        }
        return await response.text();
    } catch (error) {
        if ((error as Error)?.name === 'AbortError') {
            return undefined;
        }
        console.warn(`Map: could not read the web resource "${webResourceName}":`, error);
        return undefined;
    }
};
