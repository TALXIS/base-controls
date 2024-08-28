import { DataType } from "../enums/DataType";

export interface IGridColumn {
    key: string;
    attributeName: string;
    isPrimary?: boolean;
    dataType?: DataType;
    displayName?: string;
    entityAliasName?: string;
    isFilterable?: boolean;
    isSortable?: boolean;
    isSorted?: boolean;
    isFiltered?: boolean;
    isSortedDescending?: boolean;
    isEditable?: boolean;
    isResizable?: boolean;
    isRequired?: boolean;
    isHidden?: boolean;
    width?: number;
}