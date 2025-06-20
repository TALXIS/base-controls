import { IColumn } from "@talxis/client-libraries";

export interface IGridColumn extends IColumn {
    isRequired: boolean;
    isEditable: boolean;
    isFilterable: boolean;
    isSorted: boolean;
    isFiltered: boolean;
    canBeAggregated: boolean;
    isSortedDescending: boolean;
    isResizable: boolean;
    alignment: IColumn['alignment'],
    getEntityName: () => string
}