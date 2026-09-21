import { ICellCommandsComponents } from "../commands/components";
import { ICellControlComponents } from "../control/components";
import { ICellValidationComponents } from "../field-validation/components";
import { ICellContainerComponents } from "../container/components";
import { ICellLoadingComponents } from "../loading/components";
import { ICellResizeGripComponents } from "../row-resize-grip/components";

/**
 * The pieces every cell is built from, drawn whether it is being edited or not.
 *
 * Each slot names the piece it is drawn by, so changing one is taking that piece and spreading what the
 * slot was handed:
 *
 * ```tsx
 * components={{ container: { onRenderContainer: props => <Grid.Cell.Ui.Container {...props} className='mine' /> } }}
 * ```
 */
export interface ICellComponents {
    /** What a row is dragged taller by. */
    rowResizeGrip?: Partial<ICellResizeGripComponents>;
    /** The element the cell's content is drawn in. */
    container?: Partial<ICellContainerComponents>;
    /** What is drawn while the cell waits. */
    loading?: Partial<ICellLoadingComponents>;
    /** What draws the cell's value, or takes the input while it is being edited. */
    control?: Partial<ICellControlComponents>;
}

/** The replaceable pieces of a cell, by the part they belong to. */
export interface ICellRendererComponents extends ICellComponents {
    /** What the cell says about a value the record refuses. */
    validation?: Partial<ICellValidationComponents>;
    /** What the cell offers to do. */
    commands?: Partial<ICellCommandsComponents>;
}
