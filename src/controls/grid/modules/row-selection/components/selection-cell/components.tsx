import { IRecordSaveUiComponents } from "@controls/grid/components/record-save-indicator";
import { IRowSelectionUiCheckboxComponents } from "../ui";

/** The replaceable pieces of a row's checkbox cell, by the part they belong to. */
export interface ISelectionCellComponents extends IRecordSaveUiComponents {
    checkbox?: Partial<IRowSelectionUiCheckboxComponents>;
}
