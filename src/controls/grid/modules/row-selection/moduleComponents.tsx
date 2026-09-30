import type { ISelectionCellComponents } from "./components/selection-cell/components";
import type { ISelectionHeaderComponents } from "./components/selection-header/components";

/** The replaceable parts of what selection draws, by the piece they belong to. */
export interface IGridRowSelectionComponents {
    /** A row's checkbox cell, and the save status it shows in place of the checkbox. */
    cell?: ISelectionCellComponents;
    /** The header that selects every record. */
    header?: ISelectionHeaderComponents;
}
