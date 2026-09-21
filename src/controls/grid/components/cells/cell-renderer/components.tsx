import { IGridCellCommandsComponents } from "../commands/components";
import { IGridControlComponents } from "../control/components";
import { IGridFieldValidationComponents } from "../field-validation/components";
import { IGridCellContainerComponents } from "../container/components";
import { IGridCellLoadingComponents } from "../loading/components";
import { IGridRowResizeGripComponents } from "../row-resize-grip/components";

/**
 * The pieces every cell is built from, drawn whether it is being edited or not.
 *
 * Each slot names the `CellUi` component it is drawn by, so changing one is importing that component and
 * spreading what the slot was handed:
 *
 * ```tsx
 * components={{ container: { onRenderContainer: props => <CellUi.Container {...props} className='mine' /> } }}
 * ```
 */
export interface IGridCellComponentsBase {
    /** What a row is dragged taller by. */
    rowResizeGrip?: Partial<IGridRowResizeGripComponents>;
    /** The element the cell's content is drawn in. */
    container?: Partial<IGridCellContainerComponents>;
    /** What is drawn while the cell waits. */
    loading?: Partial<IGridCellLoadingComponents>;
    /** What draws the cell's value, or takes the input while it is being edited. */
    control?: Partial<IGridControlComponents>;
}

/** The replaceable pieces of a cell, by the part they belong to. */
export interface IGridCellComponents extends IGridCellComponentsBase {
    /** What the cell says about a value the record refuses. */
    validation?: Partial<IGridFieldValidationComponents>;
    /** What the cell offers to do. */
    commands?: Partial<IGridCellCommandsComponents>;
}
