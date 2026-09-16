import { GridApi, GridState } from "@ag-grid-community/core";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridComponents } from "./components";
import { IGridModules } from "./modules";
import { IGridLabels } from "./labels";

export interface IGrid {
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
    /** Which ribbon buttons a row offers inline, as a comma-separated list of their ids. */
    inlineRibbonButtonIds?: string;

    /** Overrides for the strings the grid renders. */
    labels?: Partial<IGridLabels>;
    /** Overrides for the parts of the grid a caller may replace. */
    components?: Partial<IGridComponents>;
    /** The AG Grid state to restore column order, widths and sorting from. */
    state?: GridState;
    /** Fired once the api exists, before the grid configures itself with it. */
    onGridReady?: (api: GridApi<IRecord>) => void;
    /**
     * Fired before the grid tears down, while its api still answers.
     *
     * `mode.setControlState` and gives it back through {@link IGrid.state}.
     */
    onDestroy?: (api: GridApi<IRecord>) => void;
}
