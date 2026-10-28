import { IIsolatedFrameContent, IsolatedFrameChannel } from "./IsolatedFrameChannel";

/** A script the frame loads: a URL, or an ES module entry. */
export type IsolatedFrameScript = string | { src: string; type: 'module' };

export interface IIsolatedComponentOptions {
    /** What the frame loads, in order; the running script by default. */
    scripts?: IsolatedFrameScript[];
    /** Called with the frame's window before its scripts load, to give it what its code reads, such as `Xrm`. */
    onPrepareWindow?: (frameWindow: Window) => void;
}

export interface IIsolatedFrameParameters extends IIsolatedComponentOptions {
    /** The name the frame's copy of the code registered its content under. */
    key: string;
}

const MOUNT_ID = 'isolated-frame-mount';

const FRAME_DOCUMENT = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body,#${MOUNT_ID}{height:100%;margin:0}</style></head><body><div id="${MOUNT_ID}"></div></body></html>`;

//only set while the bundle evaluates its modules
const RUNNING_SCRIPT = (document.currentScript as HTMLScriptElement | null)?.src || undefined;

/** Runs the content a bundle registered under a key inside an iframe, seen from the page. */
export class IsolatedFrame {
    private _parameters: IIsolatedFrameParameters;
    private _content?: IIsolatedFrameContent;
    private _container?: HTMLElement;
    private _props?: object;
    private _isDestroyed = false;

    constructor(parameters: IIsolatedFrameParameters) {
        this._parameters = parameters;
    }

    /** Gives the iframe its document and code, then renders the latest props in it. */
    public async load(iframe: HTMLIFrameElement): Promise<void> {
        try {
            await this._load(iframe);
        }
        catch (error) {
            if (!this._isDestroyed) {
                throw error;
            }
        }
    }

    /** Renders the content with these props, once the frame has loaded. */
    public render(props: object): void {
        this._props = props;
        if (this._content && this._container) {
            this._content.render(props, this._container);
        }
    }

    public destroy(): void {
        this._isDestroyed = true;
        if (this._content && this._container) {
            this._content.unmount(this._container);
        }
        this._content = undefined;
    }

    private async _load(iframe: HTMLIFrameElement): Promise<void> {
        const scripts = this._parameters.scripts ?? (RUNNING_SCRIPT ? [RUNNING_SCRIPT] : []);
        if (!scripts.length) {
            throw new Error('The frame has no script to load; pass `scripts`.');
        }
        await this._loadDocument(iframe);
        const frameWindow = iframe.contentWindow!;
        const frameDocument = frameWindow.document;
        frameDocument.documentElement.lang = document.documentElement.lang;
        frameDocument.documentElement.dir = document.documentElement.dir;
        const channel = new IsolatedFrameChannel(frameWindow);
        channel.markAsFrame();
        this._parameters.onPrepareWindow?.(frameWindow);
        for (const script of scripts) {
            await this._loadScript(frameDocument, script);
        }
        const content = channel.get(this._parameters.key);
        if (!content) {
            throw new Error(`The frame's scripts registered no frame as "${this._parameters.key}".`);
        }
        if (this._isDestroyed) {
            return;
        }
        this._content = content;
        this._container = frameDocument.getElementById(MOUNT_ID)!;
        if (this._props) {
            content.render(this._props, this._container);
        }
    }

    //a browser may still report the blank page the iframe started with
    private _loadDocument(iframe: HTMLIFrameElement): Promise<void> {
        return new Promise(resolve => {
            const onLoad = () => {
                if (iframe.contentDocument?.getElementById(MOUNT_ID)) {
                    iframe.removeEventListener('load', onLoad);
                    resolve();
                }
            };
            iframe.addEventListener('load', onLoad);
            iframe.srcdoc = FRAME_DOCUMENT;
        });
    }

    private _loadScript(frameDocument: Document, script: IsolatedFrameScript): Promise<void> {
        return new Promise((resolve, reject) => {
            const element = frameDocument.createElement('script');
            element.src = typeof script === 'string' ? script : script.src;
            if (typeof script !== 'string') {
                element.type = script.type;
            }
            element.addEventListener('load', () => resolve());
            element.addEventListener('error', () => reject(new Error(`The frame could not load "${element.src}".`)));
            frameDocument.head.appendChild(element);
        });
    }
}
