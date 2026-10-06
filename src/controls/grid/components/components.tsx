import type { IOverlayUiEmptyRecordsComponents, IOverlayUiLoadingComponents } from "./overlays/ui";
import type { IRowUiErrorComponents, IRowUiLoadingComponents } from "./rows/ui";

/** The replaceable pieces of what the grid draws itself, by the piece they belong to. */
export interface IGridComponents {
    /** What the grid shows while it loads. */
    loadingOverlay?: Partial<IOverlayUiLoadingComponents>;
    /** What the grid shows while it has no rows. */
    emptyRecordsOverlay?: Partial<IOverlayUiEmptyRecordsComponents>;
    /** What a row shows while its records load. */
    rowLoading?: Partial<IRowUiLoadingComponents>;
    /** What a row shows when its records failed. */
    rowError?: Partial<IRowUiErrorComponents>;
}
