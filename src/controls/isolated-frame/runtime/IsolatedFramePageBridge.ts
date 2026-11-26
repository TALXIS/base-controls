import { Stylesheet } from "@fluentui/react";
import { PLATFORM_CONTROL_ATTRIBUTE } from "@fields/nested-control-renderer";

export interface IIsolatedFramePageBridgeParameters {
    frameWindow: Window;
}

const FRAME_CLASS_NAMESPACE = 'frame';

//a PCF's callouts are portalled out of its container into a Fluent layer
const DRAG_SOURCES = `[${PLATFORM_CONTROL_ATTRIBUTE}], .ms-Layer`;

/** Lets a PCF the page loaded work inside the frame: it gets the page's Fluent styles and its drags. */
export class IsolatedFramePageBridge {
    private _frameWindow: Window;
    private _lifetime = new AbortController();
    private _drag?: AbortController;
    private _sheet?: CSSStyleSheet;

    constructor(parameters: IIsolatedFramePageBridgeParameters) {
        this._frameWindow = parameters.frameWindow;
        this._mirrorStyles();
        this._frameWindow.addEventListener('mousedown', this._onMouseDown, { capture: true, signal: this._lifetime.signal });
    }

    public destroy(): void {
        this._drag?.abort();
        this._lifetime.abort();
    }

    private _mirrorStyles(): void {
        //the page's and the frame's Fluent count class names separately, so one set needs a prefix
        const frameConfig = (this._frameWindow as Window & { FabricConfig?: { mergeStyles?: object } }).FabricConfig ?? {};
        Object.assign(this._frameWindow, { FabricConfig: { ...frameConfig, mergeStyles: { ...frameConfig.mergeStyles, namespace: FRAME_CLASS_NAMESPACE } } });
        const frameDocument = this._frameWindow.document;
        const style = frameDocument.createElement('style');
        style.setAttribute('data-merge-styles-mirror', '');
        frameDocument.head.appendChild(style);
        this._sheet = style.sheet!;
        document.head.querySelectorAll<HTMLStyleElement>('style[data-merge-styles]').forEach(element => {
            Array.from(element.sheet?.cssRules ?? []).forEach(rule => this._insertRule(rule.cssText));
        });
        const stopMirroring = Stylesheet.getInstance().onInsertRule(({ rule }: { rule: string }) => this._insertRule(rule)) as () => void;
        this._lifetime.signal.addEventListener('abort', () => stopMirroring());
    }

    private _insertRule(rule: string): void {
        try {
            this._sheet!.insertRule(rule, this._sheet!.cssRules.length);
        }
        catch {
            //a rule this browser cannot parse, which merge-styles skips as well
        }
    }

    //a PCF the page loaded follows a drag on the page's window, which a pointer inside the frame never reaches
    private _onMouseDown = (event: MouseEvent): void => {
        if (!(event.target as Element | null)?.closest?.(DRAG_SOURCES)) {
            return;
        }
        this._drag?.abort();
        this._drag = new AbortController();
        const options = { capture: true, signal: this._drag.signal };
        this._frameWindow.addEventListener('mousemove', this._onDragEvent, options);
        this._frameWindow.addEventListener('mouseup', this._onDragEvent, options);
    };

    private _onDragEvent = (event: MouseEvent): void => {
        window.dispatchEvent(new MouseEvent(event.type, event));
        if (event.type === 'mouseup') {
            this._drag?.abort();
        }
    };
}
