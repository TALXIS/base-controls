import { IGridColumn } from "../core/interfaces/IGridColumn";
import { Grid } from "../core/model/Grid";
import { GridDependency } from "../core/model/GridDependency";
import { SortStatus } from "./SortStatus";
export class Sorting extends GridDependency {
    private _sortingStatuses: Map<string, SortStatus> = new Map();

    constructor(grid: Grid) {
        super(grid);
    }
    public get() {
        let sorting = this._sorting;
        for(const sortingStatus of this._sortingStatuses.values()) {
            const sortingStatusValue = sortingStatus.get();
            if(sortingStatus.isAppliedToDataset) {
                sorting = sorting.filter(x => x.name !== sortingStatusValue?.name)
            }
            if(sortingStatusValue) {
                sorting.push(sortingStatusValue);
            }
        }
        return sorting;

    }

    public sortStatus(column: IGridColumn): SortStatus {
        const existingSortStatus = this._sorting.find(x => x.name === column.key);
        if(!this._sortingStatuses.get(column.key)) {
            this._sortingStatuses.set(column.key, new SortStatus(column, existingSortStatus))
        }
        return this._sortingStatuses.get(column.key)!;
    }

    private get _sorting() {
        return structuredClone(this._grid.dataset.sorting);
    }
}