import { useGridInstance } from "../../core/hooks/useGridInstance";
import { IGridColumn } from "../../core/interfaces/IGridColumn";

interface ISortingController {
    value: ComponentFramework.PropertyHelper.DataSetApi.SortStatus | undefined;
    sort: (sortDirection: ComponentFramework.PropertyHelper.DataSetApi.Types.SortDirection) => void;
}

export const useColumnSortingController = (column: IGridColumn): ISortingController => {
    const grid = useGridInstance();
    const sorting = grid.sorting;
    return {
        value: sorting.get(column),
        sort: (sortDirection: ComponentFramework.PropertyHelper.DataSetApi.Types.SortDirection) => sorting.sort(column, sortDirection)
    } 
}
