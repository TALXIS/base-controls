import type { IDatasetControlInternal } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import { IGridProps } from "../../interfaces";

const DEFAULT_ROW_HEIGHT = 42;
const DEFAULT_MAX_VISIBLE_ROWS = 15;

export interface IGridSettingsParameters {
    /** The current props: the mount-only ones are read once, the rest on demand. */
    getProps: () => IGridProps;
    /** The DatasetControl the grid is inside, if any. */
    datasetControl?: IDatasetControlInternal;
}

/** What the caller asked the grid to be. */
export interface IGridSettings {
    /** Whether a double click on a row opens the record it stands for. */
    isNavigationEnabled(): boolean;
    /** Whether every other row takes a background of its own. */
    isZebraEnabled(): boolean;
    /** Whether an option set's own colour is used for its cells. */
    isOptionSetColorsEnabled(): boolean;
    /** How tall a row is, in pixels. */
    getDefaultRowHeight(): number;
    /** How many rows the grid grows to fit before it scrolls instead. */
    getMaxVisibleRows(): number;
    /** How tall the grid is, as a CSS length, or `undefined` while it grows with its rows. */
    getHeight(): string | undefined;
}

export class GridSettings implements IGridSettings {
    private _getProps: () => IGridProps;
    private _mountProps: IGridProps;
    private _datasetControl?: IDatasetControlInternal;

    constructor(parameters: IGridSettingsParameters) {
        this._getProps = parameters.getProps;
        this._datasetControl = parameters.datasetControl;
        //taken once so a later value cannot reach only some cells
        this._mountProps = { ...parameters.getProps() };
    }

    public isNavigationEnabled(): boolean {
        return this._mountProps.enableNavigation !== false;
    }

    public isZebraEnabled(): boolean {
        return this._mountProps.enableZebra !== false;
    }

    public isOptionSetColorsEnabled(): boolean {
        return this._mountProps.enableOptionSetColors === true;
    }

    public getDefaultRowHeight(): number {
        return this._mountProps.rowHeight ?? DEFAULT_ROW_HEIGHT;
    }

    public getMaxVisibleRows(): number {
        return this._getProps().maxVisibleRows ?? DEFAULT_MAX_VISIBLE_ROWS;
    }

    public getHeight(): string | undefined {
        return getGridHeight(this._getProps().height ?? undefined, this._datasetControl);
    }
}

/** The grid's height as a CSS length; `undefined` sizes it to its rows. */
export const getGridHeight = (height: string | undefined, datasetControl: IDatasetControlInternal | undefined): string | undefined => {
    //a DatasetControl with a height sizes the grid to its body
    if (datasetControl?.getHeight()) {
        return '100%';
    }
    return height;
};
