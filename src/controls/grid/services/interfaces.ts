import { IPcfContext } from "@interfaces";
import type { GridApi } from "@ag-grid-community/core";
import type { IDataProvider, IRecord } from "@talxis/client-libraries";
import type { ITheme } from "@theme";
import type { ILocalizationService, IServiceLocator } from "@utils";
import type { IGridSettings } from "../services/settings";
import type { IGridLabels } from "../labels";
import type { IGridRuntime } from "../services/runtime";
import type { IGridRowModel } from "../modules/row-model/interfaces";
import type { IGridColumns } from "../services/columns";
import type { IGridCells } from "../services/cells";
import type { IGridKeyboard } from "../services/keyboard";
import type { IGridRows } from "../services/rows";
import type { IGridValidation } from "../services/validation";
import type { IGridSurfaces } from "../services/surfaces";
import type { IGridFields } from "../services/fields";

/** The services the modules register; a module adds its own by augmenting this. */
export interface IGridModuleServiceMap { }

/** Everything the grid is made of. */
export interface IGridServiceMap extends IGridModuleServiceMap {
    /** The grid's own element, there once it is mounted. */
    gridRoot: HTMLElement;
    /** AG Grid's own api, there once AG Grid is ready; a last resort for what the hooks cannot express. */
    gridApi: GridApi<IRecord>;
    /** What the caller asked the grid to be, with its defaults applied. */
    settings: IGridSettings;
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
    /** The column definitions and the hooks modules add to them through. */
    columns: IGridColumns;
    /** What a cell shows and the hooks modules add to it through. */
    cells: IGridCells;
    /** What the user is pressing while the grid is doing something about it. */
    keyboard: IGridKeyboard;
    /** What the modules draw over the grid. */
    surfaces: IGridSurfaces;
    /** The fields of the grid's records, saved as the grid saves. */
    fields: IGridFields;
    /** How the grid gets its rows. */
    rowModel: IGridRowModel;
    /** The running grid and the hooks over AG Grid's props. */
    grid: IGridRuntime;
}

/** The services a grid may be without, or have only once it is mounted. */
export type IGridDeferredService = keyof IGridModuleServiceMap | 'gridRoot' | 'gridApi';

/** Where the grid's parts find each other. */
export type IGridServiceLocator = IServiceLocator<IGridServiceMap>;
