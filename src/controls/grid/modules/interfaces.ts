import type { Module } from "@ag-grid-community/core";
import type { IGridServiceLocator } from "../services";

/** One thing a grid can be given rather than born with. */
export interface IGridModule {
    agGridModules?: Module[];
    /** Registers what the module contributes, if anything outlives construction. */
    onRegister?: (services: IGridServiceLocator) => void;
}

/** How the grid gets its rows. */
export interface IGridRowModelModule extends IGridModule { }

/** The AG Grid enterprise licence. */
export interface IGridLicenseModule extends IGridModule { }

/** Copying rows to the clipboard. */
export interface IGridClipboardModule extends IGridModule { }

/** The modules a grid was given. */
export interface IGridModules {
    rowModel: IGridRowModelModule;
    /** The AG Grid enterprise licence: {@link createLicenseModule}. */
    license?: IGridLicenseModule;
    /** Selecting rows: {@link createRowSelectionModule}. */
    rowSelection?: IGridModule;
    /** Highlighting cells by dragging across them: {@link createCellSelectionModule}. */
    cellSelection?: IGridModule;
    /** Sorting by a column: {@link createSortingModule}. */
    sorting?: IGridModule;
    /** Filtering by a column: {@link createFilteringModule}. */
    filtering?: IGridModule;
    /** Grouping the rows by a column: {@link createGroupingModule}. */
    grouping?: IGridModule;
    /** Totals under the rows: {@link createAggregationModule}. */
    aggregation?: IGridModule;
    /** Copying rows: {@link createClipboardModule}. */
    clipboard?: IGridClipboardModule;
    /** The caller's own modules, whose hooks place themselves against {@link GRID_MODULE_PRIORITY}. */
    custom?: IGridModule[];
}
