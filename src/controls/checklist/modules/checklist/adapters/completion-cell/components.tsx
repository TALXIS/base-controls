import type { ICellRendererComponents } from "@controls/grid";
import type { IChecklistUiCompletionCheckboxComponents } from "../../ui/completion-checkbox";

/** The replaceable pieces of the completion cell, by the part they belong to. */
export interface ICompletionCellComponents extends ICellRendererComponents {
    /** The check an item is ticked off with. */
    checkbox?: Partial<IChecklistUiCompletionCheckboxComponents>;
}
