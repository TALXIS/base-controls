import { IGridServiceLocator } from "../../services";

export interface IGridKeyboardParameters {
    services: IGridServiceLocator;
}

export type GridKeyDownHandler = (event: KeyboardEvent) => void;

/** What the user is pressing while the grid is doing something about it, and who hears it. */
export interface IGridKeyboard {
    /** The keypress the user is holding down. */
    getKeyBeingPressed(): KeyboardEvent | undefined;
    /**
     * Runs the handler for every key pressed where the grid can hear it, ahead of whatever would
     *
     * @returns What takes the handler off again.
     */
    onKeyDown(handler: GridKeyDownHandler): () => void;
    /** The grid is gone: what it put on the document goes with it. */
    destroy(): void;
}

export class GridKeyboard implements IGridKeyboard {
    private _services: IGridServiceLocator;
    private _keyBeingPressed?: KeyboardEvent;
    private _keyDownHandlers: GridKeyDownHandler[] = [];
    private _document?: Document;

    constructor(parameters: IGridKeyboardParameters) {
        this._services = parameters.services;
        this._services.whenAvailable('gridRoot', gridRoot => this._listen(gridRoot));
    }

    public getKeyBeingPressed(): KeyboardEvent | undefined {
        return this._keyBeingPressed;
    }

    public onKeyDown(handler: GridKeyDownHandler): () => void {
        this._keyDownHandlers.push(handler);
        return () => {
            this._keyDownHandlers = this._keyDownHandlers.filter(registered => registered !== handler);
        };
    }

    public destroy(): void {
        this._document?.removeEventListener('keydown', this._onKeyDown, true);
        this._document?.removeEventListener('keyup', this._onKeyUp, true);
        this._document?.removeEventListener('pointerdown', this._onKeyUp, true);
    }

    /** The document rather than the grid's own element. */
    private _listen(gridRoot: HTMLElement): void {
        this._document = gridRoot.ownerDocument;
        this._document.addEventListener('keydown', this._onKeyDown, true);
        this._document.addEventListener('keyup', this._onKeyUp, true);
        //a release heard nowhere would leave the key reading as held
        this._document.addEventListener('pointerdown', this._onKeyUp, true);
    }

    private _onKeyDown = (event: KeyboardEvent): void => {
        this._keyBeingPressed = event;
        this._keyDownHandlers.forEach(handler => handler(event));
    };

    private _onKeyUp = (): void => {
        this._keyBeingPressed = undefined;
    };
}
