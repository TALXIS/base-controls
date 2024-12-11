import { ControlHandler } from "./ControlHandler";

export class ControlRenderer {
    private _controlHandler: ControlHandler;
    private _containerElement: HTMLDivElement;
    constructor(controlHandler: ControlHandler, containerElement: HTMLDivElement) {
        this._controlHandler = controlHandler;
        this._containerElement = containerElement;
    }

    public render() {
        
    }
}