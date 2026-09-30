import { IRowSelectionUiHeaderCheckboxComponents } from "../ui";

/** The replaceable pieces of the checkbox column's header, by the part they belong to. */
export interface ISelectionHeaderComponents {
    headerCheckbox?: Partial<IRowSelectionUiHeaderCheckboxComponents>;
}
