import { IGridColumn } from "../core/interfaces/IGridColumn";
import { GridDependency } from "../core/model/GridDependency";
export class Sorting extends GridDependency {

    public get(column: IGridColumn) {
        return this._dataset.sorting.find(x => x.name === column.key);
    }

    public sort(column: IGridColumn, direction: ComponentFramework.PropertyHelper.DataSetApi.Types.SortDirection) {
        const sortMap: Map<string, ComponentFramework.PropertyHelper.DataSetApi.SortStatus> = new Map(this._dataset.sorting.map(x => [x.name, x]));
        sortMap.set(column.key, {
            name: column.key,
            sortDirection: direction
        })
        this._dataset.sorting = [...sortMap.values()];
        this._dataset.refresh();
    }
}