import { IGridServiceRegistry } from "../../runtime";
import { IGridAgGridOptions } from "../../runtime/grid";
import { GRID_MODULE_PRIORITY } from "../priorities";
import { IGridClipboardOptions } from "./createClipboardModule";

export interface IGridClipboardParameters {
    services: IGridServiceRegistry;
    options?: IGridClipboardOptions;
}

/** Copying out of the grid. */
export class GridClipboard {
    private _services: IGridServiceRegistry;
    private _options?: IGridClipboardOptions;

    constructor(parameters: IGridClipboardParameters) {
        this._services = parameters.services;
        this._options = parameters.options;
        this._addHooks();
    }

    private _addHooks(): void {
        const grid = this._services.get('grid');
        grid.hooks.agGridOptions.add(this._onAgGridOptions, GRID_MODULE_PRIORITY.clipboard);
    }

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options = { ...result.options, ...this._options };
    };
}
