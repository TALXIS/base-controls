import type { ICellRendererComponents, IGroupingUiToggleComponents } from "../../../grid";
import type { ITaskGridUiTreeCellIndentComponents } from "../../ui";

/** The replaceable pieces of the subject cell, by the part they belong to. */
export interface ITreeCellComponents extends ICellRendererComponents {
    /** The room that shows how deep in the tree the task is. */
    indent?: Partial<ITaskGridUiTreeCellIndentComponents>;
    /** The chevron that opens and closes the task. */
    toggle?: Partial<IGroupingUiToggleComponents>;
}
