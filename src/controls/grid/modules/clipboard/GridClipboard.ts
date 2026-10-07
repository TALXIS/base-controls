import { IGridServiceLocator } from "../../services";
import { IGridAgGridOptions } from "../../services/runtime";
import { GRID_MODULE_PRIORITY } from "../priorities";
import { IGridClipboardOptions } from "./createClipboardModule";

export interface IGridClipboardParameters {
    services: IGridServiceLocator;
    options?: IGridClipboardOptions;
}

/** Copying out of the grid. */
export class GridClipboard {
    private _services: IGridServiceLocator;
    private _options?: IGridClipboardOptions;

    constructor(parameters: IGridClipboardParameters) {
        this._services = parameters.services;
        this._options = parameters.options;
        this._registerHooks();
    }

    private _registerHooks(): void {
        const grid = this._services.get('grid');
        grid.registerAgGridOptions(this._onAgGridOptions, GRID_MODULE_PRIORITY.clipboard);
    }

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options = { ...result.options, ...this._options };
    };
}
