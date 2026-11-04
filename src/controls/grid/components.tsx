import type { IEmptyStateUiComponents } from "@controls/dataset-control/ui/empty-state";
import type { IOverlayUiLoadingComponents } from "./ui/overlays";
import type { IRowUiErrorComponents, IRowUiLoadingComponents } from "./ui/rows";

/** The replaceable pieces of what the grid draws over its rows. */
export interface IGridOverlayComponents {
    /** What the grid shows while it loads. */
    loading?: Partial<IOverlayUiLoadingComponents>;
    /** What the grid shows while it has no rows. */
    emptyState?: Partial<IEmptyStateUiComponents>;
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
