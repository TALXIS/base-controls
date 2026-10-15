import type { ICellRendererComponents, IGroupingUiToggleComponents } from "@controls/grid";

/** The replaceable pieces of the subject cell, by the part they belong to. */
export interface ITreeCellComponents extends ICellRendererComponents {
    /** The chevron that opens and closes the task. */
    toggle?: Partial<IGroupingUiToggleComponents>;
}
