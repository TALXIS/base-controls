import { IGrid } from "../../interfaces";

const DEFAULT_ROW_HEIGHT = 42;
const DEFAULT_MAX_VISIBLE_ROWS = 15;

export interface IGridSettingsParameters {
    /** The current props, read on demand so the grid follows them rather than the ones it was built with. */
    onGetProps: () => IGrid;
}

/**
 * What the caller asked the grid to be.
 *
 * One place the props are read and their defaults applied, so nothing else has to remember whether a flag
 * defaults on or off. Read on demand rather than resolved once, so a host that changes one gets it.
 */
export class GridSettings {
    private _getProps: () => IGrid;

    constructor(parameters: IGridSettingsParameters) {
        this._getProps = parameters.onGetProps;
    }

    /** Whether a cell may be edited in place. Off by default. */
    public isEditingEnabled(): boolean {
        return this._getProps().enableEditing === true;
    }

    /** Whether a double click on a row opens the record it stands for. On by default. */
    public isNavigationEnabled(): boolean {
        return this._getProps().enableNavigation !== false;
    }

    /** Whether every other row takes a background of its own. On by default. */
    public isZebraEnabled(): boolean {
        return this._getProps().enableZebra !== false;
    }

    /** Whether an edit saves itself, rather than waiting to be saved. Off by default. */
    public isAutoSaveEnabled(): boolean {
        return this._getProps().enableAutoSave === true;
    }

    /** Whether an option set's own colour is used for its cells. Off by default. */
    public areOptionSetColorsEnabled(): boolean {
        return this._getProps().enableOptionSetColors === true;
    }

    /** Which ribbon buttons a row offers inline, or `null` where it offers none. */
    public getInlineRibbonButtonIds(): string | null {
        return this._getProps().inlineRibbonButtonIds ?? null;
    }

    /** How tall a row is, in pixels. */
    public getDefaultRowHeight(): number {
        return this._getProps().rowHeight ?? DEFAULT_ROW_HEIGHT;
    }

    /** How many rows the grid grows to fit before it scrolls instead. */
    public getMaxVisibleRows(): number {
        return this._getProps().maxVisibleRows ?? DEFAULT_MAX_VISIBLE_ROWS;
    }
}
