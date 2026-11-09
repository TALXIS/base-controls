/**
 * Browser APIs jsdom does not implement but the packages under test touch at import time.
 * Each one is only defined when it is missing, so a future jsdom shipping it wins.
 */
class ResizeObserverStub {
    public observe(): void { }
    public unobserve(): void { }
    public disconnect(): void { }
}

if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false
    })) as unknown as typeof window.matchMedia;
}

export { };
