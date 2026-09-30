import { ICellContainerComponents } from "../cells/container/components";
import { ICellUiLockIconComponents } from "../cells/ui";

/** The replaceable pieces of the lock cell, by the part they belong to. */
export interface IRecordLockIndicatorCellComponents {
    /** The element the lock is drawn in. */
    container?: Partial<ICellContainerComponents>;
    lockIcon?: Partial<ICellUiLockIconComponents>;
}
