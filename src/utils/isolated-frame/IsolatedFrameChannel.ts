/** What a frame's copy of the code renders, driven from the page. */
export interface IIsolatedFrameContent {
    render(props: object, container: HTMLElement): void;
    unmount(container: HTMLElement): void;
}

interface IIsolatedFrameWindow extends Window {
    __isolatedFrameHost__?: true;
    __isolatedFrames__?: Record<string, IIsolatedFrameContent>;
}

/** What the page and a frame's copy of the code leave for each other on the frame's window. */
export class IsolatedFrameChannel {
    private _window: IIsolatedFrameWindow;

    constructor(window: Window) {
        this._window = window;
    }

    /** Whether the window is a frame the page is loading code into. */
    public isFrame(): boolean {
        return !!this._window.__isolatedFrameHost__;
    }

    /** Called by the page before the frame's scripts load. */
    public markAsFrame(): void {
        this._window.__isolatedFrameHost__ = true;
    }

    public register(key: string, content: IIsolatedFrameContent): void {
        const frames = this._window.__isolatedFrames__ ??= {};
        if (frames[key]) {
            throw new Error(`A frame is already registered as "${key}".`);
        }
        frames[key] = content;
    }

    public get(key: string): IIsolatedFrameContent | undefined {
        return this._window.__isolatedFrames__?.[key];
    }
}
