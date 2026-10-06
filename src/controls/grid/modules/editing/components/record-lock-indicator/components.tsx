import { ICellUiContainerComponents, ICellUiLockIconComponents } from "../../../../components/cells/ui";

/** The replaceable pieces of the lock cell, by the part they belong to. */
export interface IRecordLockIndicatorCellComponents {
    /** The element the lock is drawn in. */
    container?: Partial<ICellUiContainerComponents>;
    /** The lock itself. */
    lockIcon?: Partial<ICellUiLockIconComponents>;
}
