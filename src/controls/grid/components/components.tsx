import type { IOverlayUiEmptyRecordsComponents, IOverlayUiLoadingComponents } from "./overlays/ui";
import type { IRowUiErrorComponents, IRowUiLoadingComponents } from "./rows/ui";
import type { IRecordSaveUiComponents } from "./record-save-indicator/ui";
import type { IRecordLockIndicatorCellComponents } from "./record-lock-indicator/components";

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
    /** The cell a row reports its save in, on a grid with no checkbox column. */
    recordSaveCell?: IRecordSaveUiComponents;
    /** The cell a record locked as a whole shows its lock in. */
    recordLockCell?: IRecordLockIndicatorCellComponents;
}
