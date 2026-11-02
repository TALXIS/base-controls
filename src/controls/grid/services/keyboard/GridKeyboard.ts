import { elementContains } from "@fluentui/react";
import { IGridInternalServiceLocator } from "../../services";

export interface IGridKeyboardParameters {
    services: IGridInternalServiceLocator;
}

export type GridKeyDownHandler = (event: KeyboardEvent) => void;

/** What the user is pressing while the grid is doing something about it. */
export interface IGridKeyboard {
    /** The keypress the user is holding down. */
    getKeyBeingPressed(): KeyboardEvent | undefined;
    /**
     * Runs the handler for every key pressed inside this grid, ahead of what it lands in.
     *
     * @returns What takes the handler off again.
     */
    onKeyDown(handler: GridKeyDownHandler): () => void;
}

export class GridKeyboard implements IGridKeyboard {
    private _services: IGridInternalServiceLocator;
    private _keyBeingPressed?: KeyboardEvent;
    private _keyDownHandlers: GridKeyDownHandler[] = [];
    private _gridRoot?: HTMLElement;

    constructor(parameters: IGridKeyboardParameters) {
        this._services = parameters.services;
        this._services.observe('gridRoot', gridRoot => this._listen(gridRoot));
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

    /** Listens on the grid's document. */
    private _listen(gridRoot: HTMLElement): () => void {
        this._gridRoot = gridRoot;
        const ownerDocument = gridRoot.ownerDocument;
        const controller = new AbortController();
        const options = { capture: true, signal: controller.signal };
        ownerDocument.addEventListener('keydown', this._onKeyDown, options);
        ownerDocument.addEventListener('keyup', this._onKeyUp, options);
        //a release heard nowhere would leave the key reading as held
        ownerDocument.addEventListener('pointerdown', this._onKeyUp, options);
        return () => controller.abort();
    }

    private _onKeyDown = (event: KeyboardEvent): void => {
        this._keyBeingPressed = event;
        //covers Fluent layers only; layers hosted in the grid's root would let `contains` do this
        if (!this._gridRoot || !elementContains(this._gridRoot, event.target as HTMLElement)) {
            return;
        }
        this._keyDownHandlers.forEach(handler => handler(event));
    };

    private _onKeyUp = (): void => {
        this._keyBeingPressed = undefined;
    };
}
