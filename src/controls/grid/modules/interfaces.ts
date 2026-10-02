import type { Module } from "@ag-grid-community/core";
import type { IGridRuntime } from "../services/runtime";

/** An optional feature a grid can be given. */
export interface IGridModule {
    agGridModules?: Module[];
    /** Registers what the module contributes to the grid. */
    onRegister?: (runtime: IGridRuntime) => void;
}

/** The modules a grid was given. */
export interface IGridModules {
    rowModel: IGridModule;
    /** The AG Grid enterprise licence: {@link createLicenseModule}. */
    license?: IGridModule;
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
    /** Copying and pasting cells: {@link createClipboardModule}. */
    clipboard?: IGridModule;
    /** What legacy scripts set on a record's fields: {@link createLegacyClientApiCompatibilityModule}. */
    legacyClientApiCompatibility?: IGridModule;
    /** The caller's own modules, ordered against {@link GRID_MODULE_PRIORITY}. */
    custom?: IGridModule[];
}
