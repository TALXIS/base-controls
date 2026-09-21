import type { GridApi } from "@ag-grid-community/core";
import type { IDataProvider, IRecord } from "@talxis/client-libraries";
import type { ITheme } from "@theme";
import type { ILocalizationService, IServiceLocator } from "@utils";
import type { GridSettings } from "../services/settings";
import type { IGridLabels } from "../labels";
import type { AgGridModel } from "../services/ag-grid/AgGridModel";
import type { IGridRowModel } from "../modules/row-model/interfaces";
import type { GridColumns } from "../services/columns";
import type { GridCells } from "../services/cells";
import type { GridEditing } from "../services/editing";
import type { GridKeyboard } from "../services/keyboard";
import type { GridRows } from "../services/rows";
import type { GridColumnHeaders } from "../services/column-header";
import type { GridSurfaces } from "../services/surfaces";
import type { GridColumnLayout } from "../services/column-layout";
import type { GridOverlays } from "../services/overlays";
import type { GridSelection } from "../modules/selection/GridSelection";
import type { GridSorting } from "../modules/sorting/GridSorting";
import type { GridFiltering } from "../modules/filtering/GridFiltering";
import type { GridAggregation } from "../modules/aggregation/GridAggregation";
import type { GridGrouping } from "../modules/grouping/GridGrouping";

/** Everything the grid is made of, and when each of it turns up. */
export interface IGridServiceMap {
    /** What the caller asked the grid to be, with its defaults applied. */
    settings: GridSettings;
    /** What a cell draws: its value, and whatever a module made of it. */
    /** What is true of a row rather than of one of its cells. */
    rows: GridRows;
    /** Where the records, the columns and the paging come from. */
    provider: IDataProvider;
    /** The host context. */
    pcfContext: ComponentFramework.Context<any, any>;
    /** The grid's own element. */
    gridRoot: HTMLElement;
    /** Every string the grid renders, resolved. */
    labels: ILocalizationService<IGridLabels>;
    gridApi: GridApi<IRecord>;
    /** The theme the control was given. */
    theme: ITheme;
    /** The column definitions, and the hooks a module puts its own on them through. */
    columns: GridColumns;
    /** What a cell shows, and the hooks a module adds to it through. */
    cells: GridCells;
    /** What the user is pressing while the grid is doing something about it. */
    keyboard: GridKeyboard;
    /** Which cell the user is editing, and what the keyboard does about it. */
    editing: GridEditing;
    /** What a column header offers, assembled from what the modules registered. */
    columnHeaders: GridColumnHeaders;
    /** The widths and the order the user chose, written back to the provider. */
    columnLayout: GridColumnLayout;
    /** Which overlay the grid is showing: the spinner, the empty state, neither. */
    overlays: GridOverlays;
    /** What the modules draw over the grid. */
    surfaces: GridSurfaces;
    /** The totals under the rows. */
    aggregation: GridAggregation;
    /** Grouping the rows by a column. */
    grouping: GridGrouping;
    /** Filtering the grid by a column. */
    filtering: GridFiltering;
    /** Sorting the grid by a column. */
    sorting: GridSorting;
    /** Which records are selected. */
    selection: GridSelection;
    /** How the grid gets its rows. */
    rowModel: IGridRowModel;
    /** The wiring between the grid and AG Grid. */
    agGrid: AgGridModel;
}

/** The services that are only there when whatever registers them is. */
export type IOptionalGridService = 'gridApi' | 'gridRoot' | 'selection' | 'sorting' | 'filtering' | 'grouping' | 'aggregation';

/** Where the grid's parts find each other. */
export type IGridServiceLocator = IServiceLocator<IGridServiceMap>;
