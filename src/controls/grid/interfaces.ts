import { Module } from "ag-grid-community";
import { IColumn, IDataProvider, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { IGridColDefOverride } from "./runtime/columns/colDef";
import type { IGrid } from "./runtime/grid";
import type { IRuntimeModule, IServiceLocator } from "@core";
import type { IGridComponents } from "./components";
import type { IGridRowSettings } from "./runtime/rows";

/** What the grid's modules load, by module name; each module adds its own entry. */
export interface IGridModuleMap { }

/** An optional feature a grid can be given. */
export interface IGridModule<TName extends keyof IGridModuleMap = keyof IGridModuleMap> extends IRuntimeModule<IGridModuleMap, TName, IGrid> {
    agGridModules?: Module[];
}

/** Where the grid's loaded modules are found, by name. */
export type IGridModuleLocator = IServiceLocator<IGridModuleMap>;

/** What happens inside the grid, for a consumer to react to without reaching into its services. */
export interface IGridOpenRecordParameters {
    record: IRecord;
    /** The record to open: the row's own, or the one a lookup link points to. */
    reference: ComponentFramework.EntityReference;
    /** None for a double-click on the row. */
    columnName?: string;
}

export interface IGridEventProps {
    /** Fires once new data is in the grid. */
    onDataLoaded: () => void;
    /** Fires when the grid starts or stops loading. */
    onLoadingChanged: (isLoading: boolean) => void;
    /** Fires when a value in a record changes. */
    onRecordValueChanged: (record: IRecord, columnName: string, newValue: any) => void;
    /** Fires when a record starts saving. */
    onBeforeRecordSave: (record: IRecord) => void;
    /** Fires when a record has finished saving, with how it went. */
    onAfterRecordSave: (result: IRecordSaveOperationResult) => void;
    /** Fires when the provider has finished saving its records, with how each went. */
    onAfterSave: (results: IRecordSaveOperationResult[]) => void;
    /** Fires when the provider reports an error. */
    onError: (message: string, details?: any) => void;
    /** Fires when a record's cell is double-clicked, whether or not the record then opens. */
    onCellDoubleClicked: (record: IRecord, columnName: string) => void;
    /** Fires when a row with a record is clicked. */
    onRowClicked: (record: IRecord) => void;
    /** Fires when the focus moves to another cell, or out of the rows. */
    onFocusedCellChanged: (record: IRecord | undefined, columnName: string | undefined) => void;
    /** Fires when the user resizes or moves a column, with the provider's columns after it. */
    onColumnsChanged: (columns: IColumn[]) => void;
}

/** The grid reads its provider from `DataProviderContext`, once, at mount. */
export interface IGridProps extends Partial<IGridEventProps> {
    /** What this grid is made of, in load order; read once, at mount, and must hold a row model. */
    modules: IGridModule[];
    /** Whether a double click on a row opens its record; read once, at mount. */
    enableNavigation?: boolean;
    /** Whether option sets show their colours; read at mount, then control parameter hooks. */
    enableOptionSetColors?: boolean;
    /** Whether every other row is shaded; read at mount, then through `addCellThemeHook`. */
    enableZebra?: boolean;
    /** How tall a row is, in pixels; read at mount, then through `addRowHeightHook`. */
    rowHeight?: number;
    /** How many rows the grid grows to fit before it starts scrolling instead. */
    maxVisibleRows?: number;
    /** How tall the grid is, as a CSS length, unless a DatasetControl around it has a height. */
    height?: string;
    /** Put on the grid's own element, alongside its own classes. */
    className?: string;
    /** Overrides for the parts of what the grid draws itself, by piece. */
    components?: IGridComponents;

    /** Changes or adds columns by id, after every module's hook has run. */
    colDefs?: { [colId: string]: IGridColDefOverride };
    /** The key the grid's state is kept under, per view inside a DatasetControl. */
    stateKey?: string;
    /** Callbacks the grid runs for each row, read whenever it asks. */
    rowSettings?: IGridRowSettings;
    /** Replaces opening a record from the grid. */
    onOpenRecord?: (parameters: IGridOpenRecordParameters) => void;
    /** Called with each new grid, before it loads; subscribe and keep refs here. */
    onSetup?: (grid: IGrid) => void;
    /** Awaited after the modules load and before AG Grid renders, on every mount. */
    onLoad?: (grid: IGrid) => void | Promise<void>;
}
