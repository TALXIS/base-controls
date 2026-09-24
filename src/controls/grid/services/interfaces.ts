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
import type { IGridSurfaces } from "../services/surfaces";
import type { IGridSelection } from "../modules/selection/GridSelection";
import type { IGridSorting } from "../modules/sorting/GridSorting";
import type { IGridFiltering } from "../modules/filtering/GridFiltering";
import type { IGridAggregation } from "../modules/aggregation/GridAggregation";
import type { IGridGrouping } from "../modules/grouping/GridGrouping";

/** Everything the grid is made of, and when each of it turns up. */
export interface IGridServiceMap {
    /** What the caller asked the grid to be, with its defaults applied. */
    settings: IGridSettings;
    /** What a cell draws: its value, and whatever a module made of it. */
    /** What is true of a row rather than of one of its cells. */
    rows: IGridRows;
    /** Where the records, the columns and the paging come from. */
    provider: IDataProvider;
    /** The host context. */
    pcfContext: ComponentFramework.Context<any, any>;
    /** The grid's own element. */
    gridRoot: HTMLElement;
    /** Every string the grid renders, resolved. */
    labels: ILocalizationService<IGridLabels>;
    /** AG Grid's own api, a last resort for what the grid's hooks cannot express. */
    gridApi: GridApi<IRecord>;
    /** The theme the control was given. */
    theme: ITheme;
    /** The column definitions, and the hooks a module puts its own on them through. */
    columns: IGridColumns;
    /** What a cell shows, and the hooks a module adds to it through. */
    cells: IGridCells;
    /** What the user is pressing while the grid is doing something about it. */
    keyboard: IGridKeyboard;
    /** What the modules draw over the grid. */
    surfaces: IGridSurfaces;
    /** The totals under the rows. */
    aggregation: IGridAggregation;
    /** Grouping the rows by a column. */
    grouping: IGridGrouping;
    /** Filtering the grid by a column. */
    filtering: IGridFiltering;
    /** Sorting the grid by a column. */
    sorting: IGridSorting;
    /** Which records are selected. */
    selection: IGridSelection;
    /** How the grid gets its rows. */
    rowModel: IGridRowModel;
    /** The running grid, and the hooks over the props AG Grid is created with. */
    grid: IGridRuntime;
}

/** The services that are only there when whatever registers them is. */
export type IOptionalGridService = 'gridApi' | 'gridRoot' | 'selection' | 'sorting' | 'filtering' | 'grouping' | 'aggregation';

/** Where the grid's parts find each other. */
export type IGridServiceLocator = IServiceLocator<IGridServiceMap>;
