import { ICellRendererComponents as IGridCellRendererComponents } from "../../../../components/cells/cell-renderer/components";
import { ICellUiLockIconComponents } from "../../../../components/cells/ui";

/** The replaceable pieces of a cell that can be edited, by the part they belong to. */
export interface ICellRendererComponents extends IGridCellRendererComponents {
    /** What says the cell is locked for its record. */
    lockIcon?: Partial<ICellUiLockIconComponents>;
}
