import type { Module } from "@ag-grid-community/core";
import type { AgGridReactProps } from "@ag-grid-community/react";
import type { IRecord } from "@talxis/client-libraries";
import type { IGridServiceLocator } from "../services";
import type { IGridRowModelType } from "./row-model/interfaces";

/**
 * One thing a grid can be given rather than born with.
 *
 * A module registers what it contributes before the grid is created, so a grid can be assembled from the
 * parts a caller actually wants — and so the code only one kind of grid needs lives with that kind rather
 * than in the middle of the grid.
 */
export interface IGridModule {
    /** The AG Grid modules this one needs in the registry. */
    agGridModules?: Module[];
    /**
     * The row model this one only works on, if it is particular. Checked when the grid is assembled, which
     * throws rather than letting the combination render a grid where the feature quietly does nothing.
     */
    requiresRowModel?: IGridRowModelType;
    /** Options the grid must be created with. Merged with every other module's. */
    getInitialComponentProps?: () => Partial<AgGridReactProps<IRecord>>;
    /** Registers what the module contributes, if anything outlives construction. */
    onRegister?: (services: IGridServiceLocator) => void;
    /** Releases what the module holds — a listener on the provider outlives the grid otherwise. */
    onDestroy?: (services: IGridServiceLocator) => void;
}

/** How the grid gets its rows. Not optional: a grid has to get them from somewhere. */
export interface IGridRowModelModule extends IGridModule { }

/** The AG Grid enterprise licence. */
export interface IGridLicenseModule extends IGridModule { }

/** Copying rows to the clipboard. */
export interface IGridClipboardModule extends IGridModule { }

/** The modules a grid was given. */
export interface IGridModules {
    /**
     * How the grid gets its rows: {@link createServerSideRowModelModule} to page a dataset,
     * {@link createClientSideRowModelModule} for a set already held in memory.
     */
    rowModel: IGridRowModelModule;
    /** The AG Grid enterprise licence: {@link createLicenseModule}. Without it, AG Grid runs unlicensed. */
    license?: IGridLicenseModule;
    /** Selecting rows: {@link createSelectionModule}. Without it, nothing is selectable. */
    selection?: IGridModule;
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
}
