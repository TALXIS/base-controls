import type { GridApi } from "@ag-grid-community/core";
import type { IDataProvider, IRecord } from "@talxis/client-libraries";
import type { ILocalizationService, IServiceLocator } from "@utils";
import type { GridSettings } from "../grid/settings";
import type { IGridLabels } from "../labels";
import type { AgGridModel } from "../grid/ag-grid/AgGridModel";
import type { IGridRowModel } from "../modules/row-model/interfaces";
import type { GridTheming } from "../grid/theming";
import type { GridColumns } from "../grid/columns";
import type { GridCells } from "../grid/cells";
import type { GridColumnHeaderParts } from "../grid/column-header";
import type { GridColumnLayout } from "../grid/column-layout";
import type { GridOverlays } from "../grid/overlays";
import type { GridSelection } from "../modules/selection/GridSelection";
import type { GridSorting } from "../modules/sorting/GridSorting";
import type { GridFiltering } from "../modules/filtering/GridFiltering";
import type { GridAggregation } from "../modules/aggregation/GridAggregation";
import type { GridGrouping } from "../modules/grouping/GridGrouping";

/** Everything the grid is made of, and when each of it turns up. */
export interface IGridServiceMap {
    /** What the caller asked the grid to be, with its defaults applied. There from the start. */
    settings: GridSettings;
    /**
     * Where the records, the columns and the paging come from.
     *
     * Resolved on every lookup, so a provider handed over later is the one every part reads.
     */
    provider: IDataProvider;
    /** The host context. Needed outside React, where a cell's nested control is constructed. */
    pcfContext: ComponentFramework.Context<any, any>;
    /**
     * The grid's own element. Registered once it is mounted, which is what a part listening for a DOM event
     * ahead of AG Grid's own listeners needs — so wait for it with `whenAvailable`.
     */
    gridRoot: HTMLElement;
    /** Every string the grid renders, resolved. There from the start. */
    labels: ILocalizationService<IGridLabels>;
    /**
     * The raw AG Grid api. Registered the moment AG Grid hands one over, which is after everything that
     * does not need one — so wait for it with `whenAvailable` rather than resolving it in a constructor.
     */
    gridApi: GridApi<IRecord>;
    /** Where a theme comes from: the control's, a row's, a column's. There from the start. */
    theming: GridTheming;
    /** The column definitions, and the hooks a module puts its own on them through. There from the start. */
    columns: GridColumns;
    /** What a cell shows, and the hooks a module adds to it through. There from the start. */
    cells: GridCells;
    /** What a column header offers, assembled from what the modules registered. There from the start. */
    columnHeader: GridColumnHeaderParts;
    /** The widths and the order the user chose, written back to the provider. There from the start. */
    columnLayout: GridColumnLayout;
    /** Which overlay the grid is showing: the spinner, the empty state, neither. There from the start. */
    overlays: GridOverlays;
    /** The totals under the rows. Present when the aggregation module is registered. */
    aggregation: GridAggregation;
    /** Grouping the rows by a column. Present when the grouping module is registered. */
    grouping: GridGrouping;
    /** Filtering the grid by a column. Present when the filtering module is registered. */
    filtering: GridFiltering;
    /** Sorting the grid by a column. Present when the sorting module is registered. */
    sorting: GridSorting;
    /** Which records are selected. Present when the selection module is registered. */
    selection: GridSelection;
    /** How the grid gets its rows. Whichever row-model module the caller gave it. */
    rowModel: IGridRowModel;
    /**
     * The wiring between the grid and AG Grid: the options it is set up with, and pushing columns and rows
     * when the provider has new ones. There from the start, and registered for its lifetime rather than to
     * be resolved — it has no surface to call, because everything it used to answer now lives with whatever
     * owns it.
     */
    agGrid: AgGridModel;
}

/**
 * The services that are only there when whatever registers them is: a module's, and the api AG Grid hands
 * over once it has built a grid. Every other key is there from the moment the grid is assembled, which is
 * what lets `useGridService` type those as always present.
 */
export type IOptionalGridService = 'gridApi' | 'gridRoot' | 'selection' | 'sorting' | 'filtering' | 'grouping' | 'aggregation';

/** Where the grid's parts find each other. */
export type IGridServiceLocator = IServiceLocator<IGridServiceMap>;
