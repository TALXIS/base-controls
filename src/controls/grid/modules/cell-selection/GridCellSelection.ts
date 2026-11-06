import { IGridServiceLocator } from "../../runtime";
import { IGridAgGridOptions } from "../../runtime/grid";
import { GRID_MODULE_PRIORITY } from "../priorities";
import { IGridCellSelectionOptions } from "./createCellSelectionModule";

export interface IGridCellSelectionParameters {
    services: IGridServiceLocator;
    options?: IGridCellSelectionOptions;
}

/** Cells highlighted by dragging across them. */
export class GridCellSelection {
    private _services: IGridServiceLocator;
    private _options?: IGridCellSelectionOptions;

    constructor(parameters: IGridCellSelectionParameters) {
        this._services = parameters.services;
        this._options = parameters.options;
        this._addHooks();
    }

    private _addHooks(): void {
        const grid = this._services.get('grid');
        grid.addAgGridOptionsHook(this._onAgGridOptions, GRID_MODULE_PRIORITY.cellSelection);
    }

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.cellSelection = this._options ?? true;
    };
}
