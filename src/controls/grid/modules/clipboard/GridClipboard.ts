import { ITheme } from "@theme";
import { IGridServiceLocator } from "../../services";
import { IGridAgGridOptions, IGridStyles } from "../../services/runtime";
import { GRID_MODULE_PRIORITY } from "../priorities";
import { IGridClipboardOptions } from "./createClipboardModule";
import { getGridClipboardStyles } from "./styles";

export interface IGridClipboardParameters {
    services: IGridServiceLocator;
    options?: IGridClipboardOptions;
}

/** Copying out of the grid, and the flash that shows what was copied. */
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
        grid.registerStyles(this._onStyles, GRID_MODULE_PRIORITY.clipboard);
    }

    private _onAgGridOptions = (result: IGridAgGridOptions): void => {
        result.options = { ...result.options, ...this._options };
    };

    private _onStyles = (result: IGridStyles, theme: ITheme): void => {
        result.styles.push(getGridClipboardStyles(theme));
    };
}
