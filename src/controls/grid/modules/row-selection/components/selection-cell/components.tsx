import { IRecordSaveUiComponents } from "../../../../components/record-save-indicator/ui";
import { IRowSelectionUiCheckboxComponents } from "../ui";

/** The replaceable pieces of a row's checkbox cell, by the part they belong to. */
export interface ISelectionCellComponents extends IRecordSaveUiComponents {
    checkbox?: Partial<IRowSelectionUiCheckboxComponents>;
}
