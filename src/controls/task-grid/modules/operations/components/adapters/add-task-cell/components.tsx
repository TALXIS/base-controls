import type { ICellRendererComponents } from "@controls/grid";
import type { IAddTaskButtonComponents } from "../../ui";

/** The replaceable pieces of the add-task cell, by the part they belong to. */
export interface IAddTaskCellComponents extends Pick<ICellRendererComponents, 'container' | 'loading' | 'commands'> {
    /** The button that adds a subtask. */
    button?: Partial<IAddTaskButtonComponents>;
}
