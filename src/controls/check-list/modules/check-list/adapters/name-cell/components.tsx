import type { ICellRendererComponents } from "@controls/grid";
import type { INameCellUiComponents } from "../../ui/name-cell";

/** The replaceable pieces of the name cell, by the part they belong to. */
export interface INameCellComponents extends ICellRendererComponents {
    /** The struck-through name. */
    name?: Partial<INameCellUiComponents>;
}
