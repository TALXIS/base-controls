import { IPcfContext } from "@pcf/interfaces";
import type { GridApi } from "ag-grid-community";
import type { IDataProvider, IRecord } from "@talxis/client-libraries";
import type { ITheme } from "@theme";
import type { IServiceRegistry, IStateStore } from "@core";
import type { LabelsService } from "@labels";
import type { IGridSettings } from "./settings";
import type { IGrid } from "./grid";
import type { IGridColumns, IGridColumnsInternal } from "./columns";
import type { IGridCells, IGridCellsInternal } from "./cells";
import type { IGridKeyboard } from "./keyboard";
import type { IGridRows, IGridRowsInternal } from "./rows";
import type { IGridValidation, IGridValidationInternal } from "./validation";
import type { IGridSurfaces, IGridSurfacesInternal } from "./surfaces";
import type { IGridFields } from "./fields";
import type { IGridTheme, IGridThemeInternal } from "./theme";
import type { IGridViewport } from "./viewport";

/** Everything the grid is made of that a module or your code may use. */
export interface IGridServiceMap {
    /** AG Grid's own api, there once AG Grid is ready; a last resort for what the hooks cannot express. */
    gridApi: GridApi<IRecord>;
    /** What the grid's parts keep for the next mount. */
    state: IStateStore;
    /** What is true of a row as a whole. */
    rows: IGridRows;
    /** What the grid says about the values its records hold. */
    validation: IGridValidation;
    /** Where the records, the columns and the paging come from. */
    provider: IDataProvider;
    /** The host context. */
    pcfContext: IPcfContext;
    /** Resolves the strings of the grid and its modules. */
    labels: Pick<LabelsService, 'getLabels'>;
    /** The theme the control was given. */
    theme: ITheme;
    /** The AG Grid theme made from it, and the hooks modules edit it through. */
    gridTheme: IGridTheme;
    /** The column definitions and the hooks modules add to them through. */
    columns: IGridColumns;
    /** What a cell shows and the hooks modules add to it through. */
    cells: IGridCells;
    /** What the modules draw over the grid. */
    surfaces: IGridSurfaces;
    /** The fields of the grid's records, saved as the grid saves. */
    fields: IGridFields;
    /** What the caller asked the grid to be, with its defaults applied. */
    settings: IGridSettings;
    /** What the user is pressing while the grid is doing something about it. */
    keyboard: IGridKeyboard;
    /** The grid's vertical scroll and header height. */
    viewport: IGridViewport;
    /** The running grid. */
    grid: IGrid;
}

/** The services as the grid's own parts use them: what draws the grid; a module adds what its own parts read by augmenting this. */
export interface IGridServiceMapInternal extends IGridServiceMap {
    /** The grid's own element, there once it is mounted. */
    gridRoot: HTMLElement;
    rows: IGridRowsInternal;
    validation: IGridValidationInternal;
    gridTheme: IGridThemeInternal;
    columns: IGridColumnsInternal;
    cells: IGridCellsInternal;
    surfaces: IGridSurfacesInternal;
}

/** The services a grid may be without, or have only once it is mounted. */
export type IGridDeferredService = 'gridRoot' | 'gridApi';

/** Where the grid's parts find each other; a module passes its own map to see the services it adds. */
export type IGridServiceRegistry<TServices extends IGridServiceMap = IGridServiceMap> = IServiceRegistry<TServices>;

export type IGridServiceRegistryInternal<TServices extends IGridServiceMapInternal = IGridServiceMapInternal> = IServiceRegistry<TServices>;
