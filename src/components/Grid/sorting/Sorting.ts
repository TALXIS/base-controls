import { IGridColumn } from "../core/interfaces/IGridColumn";
import { GridDependency } from "../core/model/GridDependency";
export class Sorting extends GridDependency {
    public get(column: IGridColumn) {
        return {
            value: this._dataset.sorting.find(x => x.name === column.key),
            sort: (direction: ComponentFramework.PropertyHelper.DataSetApi.Types.SortDirection) => {
                const sortMap: Map<string, ComponentFramework.PropertyHelper.DataSetApi.SortStatus> = new Map(this._dataset.sorting.map(x => [x.name, x]));
                //TODO: have explicit parameter to always do multisort?
                if(this._grid.keyHoldListener.getHeldKey() !== 'Shift') {
                    sortMap.clear();
                }
                sortMap.set(column.key, {
                    name: column.key,
                    sortDirection: direction
                })
                //Power Apps only allows setting of sorting like this - https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
                //this is so stupid
                while (this._dataset.sorting.length) {
                    this._dataset.sorting.pop()
                }
                for (const sort of sortMap.values()) {
                    this._dataset.sorting.push(sort);
                }
                this._dataset.refresh();
            }
        }
    }
}