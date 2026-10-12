import type { IEmptyRecordsUiComponents } from "@controls/dataset-control/components/ui/empty-records";
import type { IOverlayUiLoadingComponents } from "./overlays/ui";
import type { IRowUiErrorComponents, IRowUiLoadingComponents } from "./rows/ui";

/** The replaceable pieces of what the grid draws over its rows. */
export interface IGridOverlayComponents {
    /** What the grid shows while it loads. */
    loading?: Partial<IOverlayUiLoadingComponents>;
    /** What the grid shows while it has no rows. */
    emptyRecords?: Partial<IEmptyRecordsUiComponents>;
}

/** The replaceable pieces of the rows the grid draws in place of records. */
export interface IGridRowComponents {
    /** What a row shows while its records load. */
    loading?: Partial<IRowUiLoadingComponents>;
    /** What a row shows when its records failed. */
    error?: Partial<IRowUiErrorComponents>;
}

/** The replaceable pieces of what the grid draws itself, by the piece they belong to. */
export interface IGridComponents {
    overlays?: IGridOverlayComponents;
    rows?: IGridRowComponents;
}
