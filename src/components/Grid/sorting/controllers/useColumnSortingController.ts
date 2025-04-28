import { useEffect, useState } from "react";
import { useGridInstance } from "../../core/hooks/useGridInstance";
import { IGridColumn } from "../../core/interfaces/IGridColumn";

interface ISortingController {
    value: ComponentFramework.PropertyHelper.DataSetApi.SortStatus | undefined;
    sort: (sortDirection: ComponentFramework.PropertyHelper.DataSetApi.Types.SortDirection) => void;
    clear: () => void;
}

export const useColumnSortingController = (column: IGridColumn): ISortingController => {
    const grid = useGridInstance();
    const sorting = grid.sorting.get(column);

    const getController = (): ISortingController => {
        return {
            value: sorting.value,
            sort: (direction) => sorting.sort(direction),
            clear: () => sorting.clear()
        }
    }
    const [controller, setController] = useState<ISortingController>(() => getController())

    useEffect(() => {
        setController(getController())
    }, [sorting.value]);
    return controller;
}
