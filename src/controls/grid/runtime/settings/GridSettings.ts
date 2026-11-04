import type { IDatasetControlRuntime } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import { IGridProps } from "../../interfaces";

const DEFAULT_ROW_HEIGHT = 42;
const DEFAULT_MAX_VISIBLE_ROWS = 15;

export interface IGridSettingsParameters {
    /** The current props: the mount-only ones are read once, the rest on demand. */
    onGetProps: () => IGridProps;
    /** The DatasetControl the grid is inside, if any. */
    datasetControl?: IDatasetControlRuntime;
}

/** What the caller asked the grid to be. */
export interface IGridSettings {
    /** Whether a double click on a row opens the record it stands for. */
    isNavigationEnabled(): boolean;
    /** Whether every other row takes a background of its own. */
    isZebraEnabled(): boolean;
    /** Whether an option set's own colour is used for its cells. */
    areOptionSetColorsEnabled(): boolean;
    /** How tall a row is, in pixels. */
    getDefaultRowHeight(): number;
    /** How many rows the grid grows to fit before it scrolls instead. */
    getMaxVisibleRows(): number;
    /** How tall the grid is, as a CSS length, or `undefined` while it grows with its rows. */
    getHeight(): string | undefined;
    /** The caller's changes to the columns, by id, read on every build. */
    getColDefs(): NonNullable<IGridProps['colDefs']>;
    /** The caller's per-row callbacks, read on every ask. */
    getRowSettings(): NonNullable<IGridProps['rowSettings']>;
}

export class GridSettings implements IGridSettings {
    private _getProps: () => IGridProps;
    private _mountProps: IGridProps;
    private _datasetControl?: IDatasetControlRuntime;

    constructor(parameters: IGridSettingsParameters) {
        this._getProps = parameters.onGetProps;
        this._datasetControl = parameters.datasetControl;
        //taken once so a later value cannot reach only some cells
        this._mountProps = { ...parameters.onGetProps() };
    }

    public isNavigationEnabled(): boolean {
        return this._mountProps.enableNavigation !== false;
    }

    public isZebraEnabled(): boolean {
        return this._mountProps.enableZebra !== false;
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

    public getHeight(): string | undefined {
        //a DatasetControl with a height sizes the grid to its body
        if (this._datasetControl?.getHeight()) {
            return '100%';
        }
        return this._getProps().height ?? undefined;
    }

    public getColDefs(): NonNullable<IGridProps['colDefs']> {
        return this._getProps().colDefs ?? {};
    }

    public getRowSettings(): NonNullable<IGridProps['rowSettings']> {
        return this._getProps().rowSettings ?? {};
    }
}
