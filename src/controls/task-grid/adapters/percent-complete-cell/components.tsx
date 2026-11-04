import type { ICellRendererComponents } from "@controls/grid";
import type { ITaskGridUiPercentCompleteComponents } from "../../ui";

/** The replaceable pieces of the percent complete cell, by the part they belong to. */
export interface IPercentCompleteCellComponents extends ICellRendererComponents {
    /** The bar drawn while the cell is not being edited. */
    progress?: Partial<ITaskGridUiPercentCompleteComponents>;
}
