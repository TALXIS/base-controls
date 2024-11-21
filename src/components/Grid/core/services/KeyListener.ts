export class KeyHoldListener {
    private _currentlyHeldKey: string | null = null;
    private _keyDownHandlers: Set<(e: KeyboardEvent) => void> = new Set();
    constructor() {
        window.addEventListener('keydown', this._onKeyDown.bind(this));
        window.addEventListener('keyup', this._onKeyUp.bind(this));
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
        window.removeEventListener('keydown', this._onKeyDown);
    }
}