import { IGridCellCommandsComponents } from "../commands/components";
import { IGridControlComponents } from "../control/components";
import { IGridFieldValidationComponents } from "../field-validation/components";
import { IGridCellLoadingComponents } from "../loading/components";
import { IGridRowResizeGripComponents } from "../row-resize-grip/components";

/** The replaceable pieces of a cell, by the part they belong to. */
export interface IGridCellComponents {
    /** What a row is dragged taller by. */
    rowResizeGrip?: Partial<IGridRowResizeGripComponents>;
    /** What is drawn while the cell waits. */
    loading?: Partial<IGridCellLoadingComponents>;
    /** What the cell says about a value the record refuses. */
    validation?: Partial<IGridFieldValidationComponents>;
    /** What draws the cell's value. */
    control?: Partial<IGridControlComponents>;
    /** What the cell offers to do. */
    commands?: Partial<IGridCellCommandsComponents>;
}
