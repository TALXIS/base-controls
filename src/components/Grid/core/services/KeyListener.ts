export class KeyHoldListener {
    private _currentlyHeldKey: string | null = null;
    constructor() {
        window.addEventListener('keydown', this._onKeyDown.bind(this));
        window.addEventListener('keyup', this._onKeyUp.bind(this));
    }
    public getHeldKey(): string | null {
        return this._currentlyHeldKey;
    }
    private _onKeyDown(e: KeyboardEvent) {
        this._currentlyHeldKey = e.key;
    }
    private _onKeyUp(e: KeyboardEvent) {
        this._currentlyHeldKey = null;
    }
    destroy() {
        window.removeEventListener('keydown', this._onKeyDown);
    }
}