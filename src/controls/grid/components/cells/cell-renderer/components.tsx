import { ICellUiCommandsComponents, ICellUiContainerComponents, ICellUiFieldErrorComponents, ICellUiLoadingComponents, ICellUiResizeGripComponents } from "../ui";
import { ICellControlComponents } from "../control/components";

/** The pieces every cell is built from, drawn whether it is being edited or not. */
export interface ICellComponents {
    /** What a row is dragged taller by. */
    resizeGrip?: Partial<ICellUiResizeGripComponents>;
    /** The element the cell's content is drawn in. */
    container?: Partial<ICellUiContainerComponents>;
    /** What is drawn while the cell waits. */
    loading?: Partial<ICellUiLoadingComponents>;
    /** What draws the cell's value, or takes the input while it is being edited. */
    control?: Partial<ICellControlComponents>;
}

/** The replaceable pieces of a cell, by the part they belong to. */
export interface ICellRendererComponents extends ICellComponents {
    /** What the cell says about a value the record refuses. */
    fieldError?: Partial<ICellUiFieldErrorComponents>;
    /** What the cell offers to do. */
    commands?: Partial<ICellUiCommandsComponents>;
}
