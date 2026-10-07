import { GridState, Module } from "ag-grid-community";
import { IColumn, IDataProvider, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { IGridColDefOverride } from "./services/columns/colDef";
import { IGridLabels } from "./labels";
import type { IGridRuntime } from "./services/runtime";
import type { IGridComponents } from "./components/components";
import type { IGridRowSettings } from "./services/rows";

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
    /** Editing the cells, and saving what is edited: {@link createEditingModule}. */
    editing?: IGridModule;
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

/** What happens inside the grid, for a consumer to react to without reaching into its services. */
export interface IGridOpenRecordParams {
    record: IRecord;
    /** The record to open: the row's own, or the one a lookup link points to. */
    reference: ComponentFramework.EntityReference;
    /** None for a double-click on the row. */
    columnName?: string;
}

export interface IGridEventHandlers {
    /** Fired once new data is in the grid. */
    onDataLoaded: () => void;
    /** Fired when the grid starts or stops loading. */
    onLoadingChanged: (isLoading: boolean) => void;
    /** Fired when a value in a record changes. */
    onRecordValueChanged: (record: IRecord, columnName: string, newValue: any) => void;
    /** Fired when a record starts saving. */
    onBeforeRecordSaved: (record: IRecord) => void;
    /** Fired when a record has finished saving, with how it went. */
    onAfterRecordSaved: (result: IRecordSaveOperationResult) => void;
    /** Fired when the provider has finished saving its records, with how each went. */
    onAfterSaved: (results: IRecordSaveOperationResult[]) => void;
    /** Fired when the provider reports an error. */
    onError: (message: string, details?: any) => void;
    /** Fired when a record's cell is double-clicked, whether or not the record then opens. */
    onCellDoubleClicked: (record: IRecord, columnName: string) => void;
    /** Fired when a row with a record is clicked. */
    onRowClicked: (record: IRecord) => void;
    /** Fired when the focus moves to another cell, or out of the rows. */
    onFocusedCellChanged: (record: IRecord | undefined, columnName: string | undefined) => void;
    /** Fired when the user resizes or moves a column, with the provider's columns after it. */
    onColumnsChanged: (columns: IColumn[]) => void;
}

export interface IGrid extends Partial<IGridEventHandlers> {
    /** Where the records, the columns and the paging come from; read once, at mount. */
    provider: IDataProvider;
    /** What this grid is made of; read once, at mount. */
    modules: IGridModules;
    /** Whether a double click on a row opens its record; read once, at mount. */
    enableNavigation?: boolean;
    /** Whether option sets show their colours; read at mount, then control parameter hooks. */
    enableOptionSetColors?: boolean;
    /** Whether every other row is shaded; read at mount, then through `registerCellTheme`. */
    enableZebra?: boolean;
    /** How tall a row is, in pixels; read at mount, then through `registerRowHeight`. */
    rowHeight?: number;
    /** How many rows the grid grows to fit before it starts scrolling instead. */
    maxVisibleRows?: number;
    /** How tall the grid is, as a CSS length. */
    height?: string;
    /** Put on the grid's own element, alongside its own classes. */
    className?: string;
    /** Overrides for the parts of what the grid draws itself, by piece. */
    components?: IGridComponents;

    /** Overrides for the strings the grid renders; read once, at mount. */
    labels?: Partial<IGridLabels>;
    /** Changes or adds columns by id, after every module's hook has run. */
    colDefs?: { [colId: string]: IGridColDefOverride };
    /** Callbacks the grid runs for each row, read whenever it asks. */
    rowSettings?: IGridRowSettings;
    /** AG Grid state for column order, widths and sorting; read at mount, then `gridApi`. */
    state?: GridState;
    /** Replaces opening a record from the grid. */
    onOpenRecord?: (params: IGridOpenRecordParams) => void;
    /** Fired once AG Grid is ready, with its api among the runtime's services. */
    onGridReady?: (runtime: IGridRuntime) => void;
    /** Fired before the grid tears down, while its api still answers. */
    onDestroyed?: (runtime: IGridRuntime) => void;
}
