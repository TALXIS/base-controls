export class KeyHoldListener {
    private _currentlyHeldKey: string | null = null;
    private _keyDownHandlers: Set<(e: KeyboardEvent) => void> = new Set();
    private _onKeyDownRef: (e: KeyboardEvent) => void;
    private _onKeyUpRef: (e: KeyboardEvent) => void;

    constructor() {
        this._onKeyDownRef = (e) => this._onKeyDown(e);
        this._onKeyUpRef = (e) => this._onKeyUp(e);
        window.addEventListener('keydown', this._onKeyDownRef);
        window.addEventListener('keyup', this._onKeyUpRef);
    }
    public getHeldKey(): string | null {
        return this._currentlyHeldKey;
    }
    public addOnKeyDownHandler(handler: (e: KeyboardEvent) => void) {
        this._keyDownHandlers.add(handler);
    }
    private _onKeyDown(e: KeyboardEvent) {
        this._currentlyHeldKey = e.key;
        [...this._keyDownHandlers.values()].map(handler => handler(e));
    }
    private _onKeyUp(e: KeyboardEvent) {
        this._currentlyHeldKey = null;
    }
    destroy() {
        this._keyDownHandlers.clear();
        window.removeEventListener('keydown', this._onKeyDownRef);
        window.removeEventListener('keyup', this._onKeyUpRef);
    }
}