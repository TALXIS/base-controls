import { IGridControlComponents } from "../control/components";
import { IGridCellLoadingComponents } from "../loading/components";
import { IGridRowResizeGripComponents } from "../row-resize-grip/components";

/** The replaceable pieces of a cell being edited, by the part they belong to. */
export interface IGridCellEditorComponents {
    /** What a row is dragged taller by. */
    rowResizeGrip?: Partial<IGridRowResizeGripComponents>;
    /** What is drawn while the cell waits. */
    loading?: Partial<IGridCellLoadingComponents>;
    /** What takes the input. */
    control?: Partial<IGridControlComponents>;
}
