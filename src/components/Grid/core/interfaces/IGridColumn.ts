import { IColumn } from "@talxis/client-libraries";

export interface IGridColumn extends IColumn {
    isRequired: boolean;
    isEditable: boolean;
    isFilterable: boolean;
    isSorted: boolean;
    isFiltered: boolean;
    isSortedDescending: boolean;
    isResizable: boolean;
}