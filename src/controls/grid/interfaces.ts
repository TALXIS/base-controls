import { GridState } from "@ag-grid-community/core";
import { IDataProvider, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { IGridComponents } from "./components";
import { IGridModules } from "./modules";
import { IGridLabels } from "./labels";
import type { IGridRuntime } from "./services/runtime";
import type { IGridEditedCell } from "./services/editing";

/** What happens inside the grid, for a consumer to react to without reaching into its services. */
export interface IGridEventHandlers {
    /** Fired once new data is in the grid. */
    onDataLoaded: () => void;
    /** Fired when the grid starts or stops loading. */
    onLoadingChanged: (isLoading: boolean) => void;
    /** Fired when the selected records change. */
    onSelectionChanged: (selectedRecordIds: string[]) => void;
    /** Fired when a value in a record changes. */
    onRecordValueChanged: (record: IRecord, columnName: string, newValue: any) => void;
    /** Fired when a record starts saving. */
    onBeforeRecordSave: (record: IRecord) => void;
    /** Fired when a record has finished saving, with how it went. */
    onAfterRecordSave: (result: IRecordSaveOperationResult) => void;
    /** Fired when the provider reports an error. */
    onError: (message: string, details?: any) => void;
    /** Fired when an editor opens or closes, with the cell now edited if any. */
    onEditedCellChanged: (cell: IGridEditedCell | undefined) => void;
    /** Fired when a record's cell is double-clicked, whether or not the record then opens. */
    onCellDoubleClicked: (record: IRecord, columnName: string) => void;
}

export interface IGrid extends Partial<IGridEventHandlers> {
    /** Where the records, the columns and the paging come from. */
    provider: IDataProvider;
    /** What this grid is made of. */
    modules: IGridModules;

    /** Whether a cell may be edited in place. */
    enableEditing?: boolean;
    /** Whether a double click on a row opens the record it stands for. */
    enableNavigation?: boolean;
    /** Whether an option set's own colour is used for its cells. */
    enableOptionSetColors?: boolean;
    /** Whether every other row takes a background of its own. */
    enableZebra?: boolean;
    /** Whether an edit saves itself, rather than waiting to be saved. */
    enableAutoSave?: boolean;
    /** How tall a row is, in pixels. */
    rowHeight?: number;
    /** How many rows the grid grows to fit before it starts scrolling instead. */
    maxVisibleRows?: number;
    /** How tall the grid is, as a CSS length. */
    height?: string;
    /** Put on the grid's own element, alongside its own classes. */
    className?: string;

    /** Overrides for the strings the grid renders. */
    labels?: Partial<IGridLabels>;
    /** Overrides for the parts of the grid a caller may replace. */
    components?: Partial<IGridComponents>;
    /** The AG Grid state to restore column order, widths and sorting from. */
    state?: GridState;
    /** Fired once AG Grid is ready, with its api among the runtime's services. */
    onGridReady?: (runtime: IGridRuntime) => void;
    /** Fired before the grid tears down, while the api among the runtime's services still answers. */
    onDestroy?: (runtime: IGridRuntime) => void;
}
