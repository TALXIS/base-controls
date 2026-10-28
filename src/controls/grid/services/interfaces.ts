import { IPcfContext } from "@interfaces";
import type { GridApi } from "ag-grid-community";
import type { IDataProvider, IRecord } from "@talxis/client-libraries";
import type { ITheme } from "@theme";
import type { ILocalizationService, IServiceLocator, IStateStore } from "@utils";
import type { IGridSettings } from "../services/settings";
import type { IGridLabels } from "../labels";
import type { IGrid } from "../services/runtime";
import type { IGridColumns, IGridColumnsInternal } from "../services/columns";
import type { IGridCells, IGridCellsInternal } from "../services/cells";
import type { IGridKeyboard } from "../services/keyboard";
import type { IGridRows, IGridRowsInternal } from "../services/rows";
import type { IGridValidation, IGridValidationInternal } from "../services/validation";
import type { IGridSurfaces, IGridSurfacesInternal } from "../services/surfaces";
import type { IGridFields } from "../services/fields";
import type { IGridTheme, IGridThemeInternal } from "../services/theme";
import type { IGridViewport } from "../services/viewport";

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
    /** Every string the grid renders, resolved. */
    labels: ILocalizationService<IGridLabels>;
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
export interface IGridInternalServiceMap extends IGridServiceMap {
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
export type IGridServiceLocator<TServices extends IGridServiceMap = IGridServiceMap> = IServiceLocator<TServices>;

export type IGridInternalServiceLocator<TServices extends IGridInternalServiceMap = IGridInternalServiceMap> = IServiceLocator<TServices>;
