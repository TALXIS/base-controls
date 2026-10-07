import { ITheme } from "@theme";
import { IGridServiceLocator } from "../../services";
import { IGridAgGridOptions, IGridStyles } from "../../services/runtime";
import { GRID_MODULE_PRIORITY } from "../priorities";
import { IGridCellSelectionOptions } from "./createCellSelectionModule";
import { getGridCellSelectionStyles } from "./styles";

export interface IGridCellSelectionParameters {
    services: IGridServiceLocator;
    options?: IGridCellSelectionOptions;
}

/** Cells highlighted by dragging across them, drawn as the grid draws its other highlights. */
export class GridCellSelection {
    private _services: IGridServiceLocator;
    private _options?: IGridCellSelectionOptions;

    constructor(parameters: IGridCellSelectionParameters) {
        this._services = parameters.services;
        this._options = parameters.options;
        this._registerHooks();
    }

    private _registerHooks(): void {
        const grid = this._services.get('grid');
        grid.registerAgGridOptions(this._onAgGridOptions, GRID_MODULE_PRIORITY.cellSelection);
        grid.registerStyles(this._onStyles, GRID_MODULE_PRIORITY.cellSelection);
    }

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options.cellSelection = this._options ?? true;
    };

    private _onStyles = (result: IGridStyles, theme: ITheme): void => {
        result.styles.push(getGridCellSelectionStyles(theme));
    };
}
