import { GridApi, GridState } from "@ag-grid-community/core";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridComponents } from "./grid/components";
import { IGridModules } from "./modules";
import { IGridLabels } from "./labels";

export interface IGrid {
    /**
     * Where the records, the columns and the paging come from.
     *
     * Read on demand, so a grid follows a provider it is given later — but swapping one for another is a
     * different set of records, which the grid treats as a reload rather than an update.
     */
    provider: IDataProvider;
    /**
     * What this grid is made of.
     *
     * Read once, from the first render: a row model cannot be swapped on a live grid, and the options a
     * module contributes are ones AG Grid only reads while building one. To change them, remount.
     */
    modules: IGridModules;

    /**
     * Whether a cell may be edited in place. Off by default.
     *
     * Also decides whether a double click navigates: on an editable grid it does not, because a double
     * click there means "edit this" on some columns and "open this" on others.
     */
    enableEditing?: boolean;
    /** Whether a double click on a row opens the record it stands for. On by default. */
    enableNavigation?: boolean;
    /** Whether an option set's own colour is used for its cells. Off by default. */
    enableOptionSetColors?: boolean;
    /** Whether every other row takes a background of its own. On by default. */
    enableZebra?: boolean;
    /** Whether an edit saves itself, rather than waiting to be saved. Off by default. */
    enableAutoSave?: boolean;
    /** How tall a row is, in pixels. Only read as the grid is created; AG Grid crashes if it is set later. */
    rowHeight?: number;
    /**
     * How many rows the grid grows to fit before it starts scrolling instead. Only applies while
     * `height` is unset — an explicit height always wins.
     */
    maxVisibleRows?: number;
    /** How tall the grid is, as a CSS length. Unset lets it grow to its rows, up to `maxVisibleRows`. */
    height?: string;
    /** Put on the grid's own element, alongside its own classes. */
    className?: string;
    /** Which ribbon buttons a row offers inline, as a comma-separated list of their ids. */
    inlineRibbonButtonIds?: string;

    /** Overrides for the strings the grid renders. Anything left out keeps its English default. */
    labels?: Partial<IGridLabels>;
    /** Overrides for the parts of the grid a caller may replace. */
    components?: Partial<IGridComponents>;
    /**
     * The AG Grid state to restore column order, widths and sorting from — whatever a previous instance
     * reported through {@link IGrid.onDestroy}.
     */
    state?: GridState;
    /**
     * Fired once the api exists, before the grid configures itself with it.
     *
     * Early on purpose: the grid's first act is to push its columns, so anything that means to configure
     * those has to be holding the api by now.
     */
    onGridReady?: (api: GridApi<IRecord>) => void;
    /**
     * Fired before the grid tears down, while its api still answers.
     *
     * `api.getState()` here is the whole of what is worth keeping; a PCF host hands that to
     * `mode.setControlState` and gives it back through {@link IGrid.state}.
     */
    onDestroy?: (api: GridApi<IRecord>) => void;
}
