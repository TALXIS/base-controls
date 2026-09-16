import { IGridServiceLocator } from "../../services";

export interface IGridKeyboardParameters {
    services: IGridServiceLocator;
}

/** What the user is pressing while the grid is doing something about it. */
export class GridKeyboard {
    private _services: IGridServiceLocator;
    private _keyBeingPressed?: KeyboardEvent;
    private _document?: Document;

    constructor(parameters: IGridKeyboardParameters) {
        this._services = parameters.services;
        this._services.whenAvailable('gridRoot', gridRoot => this._listen(gridRoot));
    }

    /**
     * The keypress the user is holding down, where the grid is what heard it go down.
     *
     * What a control closing its own editor asks: a close the user pressed Enter for carries the highlight
     * on as a native one does - up rather than down where they held Shift - and a close they clicked for
     * leaves it where it is.
     */
    public getKeyBeingPressed(): KeyboardEvent | undefined {
        return this._keyBeingPressed;
    }

    /** The grid is gone: what it put on the document goes with it. */
    public destroy(): void {
        this._document?.removeEventListener('keydown', this._onKeyDown, true);
        this._document?.removeEventListener('keyup', this._onKeyUp, true);
        this._document?.removeEventListener('pointerdown', this._onKeyUp, true);
    }

    /**
     * The document rather than the grid's own element: a control's popup - a calendar, a list of options -
     * is drawn in a layer outside the grid, and a key pressed in one is still a key pressed at a cell.
     */
    private _listen(gridRoot: HTMLElement): void {
        this._document = gridRoot.ownerDocument;
        this._document.addEventListener('keydown', this._onKeyDown, true);
        this._document.addEventListener('keyup', this._onKeyUp, true);
        //a key whose release was never heard would otherwise still read as held, and a pointer is the other
        //way a control is asked to close its editor
        this._document.addEventListener('pointerdown', this._onKeyUp, true);
    }

    private _onKeyDown = (event: KeyboardEvent): void => {
        this._keyBeingPressed = event;
    };

    private _onKeyUp = (): void => {
        this._keyBeingPressed = undefined;
    };
}
