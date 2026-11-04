import { ICellUiContainerComponents } from "../../../../ui/cells";
import { IRowSelectionUiCheckboxComponents } from "../../ui";

/** The replaceable pieces of a row's checkbox cell, by the part they belong to. */
export interface ISelectionCellComponents {
    /** The element the checkbox is drawn in. */
    container?: Partial<ICellUiContainerComponents>;
    checkbox?: Partial<IRowSelectionUiCheckboxComponents>;
}
