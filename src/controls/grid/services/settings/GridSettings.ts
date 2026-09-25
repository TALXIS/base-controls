import { IGrid } from "../../interfaces";

const DEFAULT_ROW_HEIGHT = 42;
const DEFAULT_MAX_VISIBLE_ROWS = 15;

export interface IGridSettingsParameters {
    /** The current props: the mount-only ones are read once, the rest on demand. */
    onGetProps: () => IGrid;
}

/** What the caller asked the grid to be. */
export interface IGridSettings {
    /** Whether a cell may be edited in place. */
    isEditingEnabled(): boolean;
    /** Whether a double click on a row opens the record it stands for. */
    isNavigationEnabled(): boolean;
    /** Whether every other row takes a background of its own. */
    isZebraEnabled(): boolean;
    /** Whether an edit saves itself, rather than waiting to be saved. */
    isAutoSaveEnabled(): boolean;
    /** Whether an option set's own colour is used for its cells. */
    areOptionSetColorsEnabled(): boolean;
    /** How tall a row is, in pixels. */
    getDefaultRowHeight(): number;
    /** How many rows the grid grows to fit before it scrolls instead. */
    getMaxVisibleRows(): number;
    getColDefs(): NonNullable<IGrid['colDefs']>;
}

export class GridSettings implements IGridSettings {
    private _getProps: () => IGrid;
    private _mountProps: IGrid;

    constructor(parameters: IGridSettingsParameters) {
        this._getProps = parameters.onGetProps;
        //taken once: a later value is ignored, rather than reaching some cells and not others
        this._mountProps = { ...parameters.onGetProps() };
    }

    public isEditingEnabled(): boolean {
        return this._mountProps.enableEditing === true;
    }

    public isNavigationEnabled(): boolean {
        return this._mountProps.enableNavigation !== false;
    }

    public isZebraEnabled(): boolean {
        return this._mountProps.enableZebra !== false;
    }

    public isAutoSaveEnabled(): boolean {
        return this._getProps().enableAutoSave === true;
    }

    public areOptionSetColorsEnabled(): boolean {
        return this._mountProps.enableOptionSetColors === true;
    }

    public getDefaultRowHeight(): number {
        return this._mountProps.rowHeight ?? DEFAULT_ROW_HEIGHT;
    }

    public getMaxVisibleRows(): number {
        return this._getProps().maxVisibleRows ?? DEFAULT_MAX_VISIBLE_ROWS;
    }

    public getColDefs(): NonNullable<IGrid['colDefs']> {
        return this._mountProps.colDefs ?? [];
    }
}
