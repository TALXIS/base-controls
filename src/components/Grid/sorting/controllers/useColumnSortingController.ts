import { useGridInstance } from "../../core/hooks/useGridInstance";
import { IGridColumn } from "../../core/interfaces/IGridColumn";

interface ISortingController {
    value: ComponentFramework.PropertyHelper.DataSetApi.SortStatus | undefined
    set: (sortDirection: ComponentFramework.PropertyHelper.DataSetApi.Types.SortDirection) => void;
    saveAndRefresh: () => void
}

export const useColumnSortingController = (column: IGridColumn): [ISortingController] => {
    const grid = useGridInstance();
    const sort = grid.sorting.sortStatus(column)

    const saveAndRefresh = () => {
        grid.dataset.sorting = grid.sorting.get();
        grid.dataset.refresh();
    }

    return [{
        value: sort.get(),
        set: (sortDirection) => sort.set(sortDirection),
        saveAndRefresh: saveAndRefresh
    }]  
}
