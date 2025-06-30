import { IDataset } from "@talxis/client-libraries";
import { DatasetExtension } from "../core/model/DatasetExtension";


interface IDependencies {
    onGetDataset: () => IDataset;
    onGetCurrentlyHeldKey?: () => string;
}

interface IColumnSortingDependencies {
    columnName: string;
    onGetDataset: () => IDataset;
    onGetCurrentlyHeldKey?: () => string | undefined;
}

class ColumnSorting extends DatasetExtension {
    private _columnName: string;
    private _getCurrentlyHeldKey?: () => string | undefined;

    constructor({columnName, onGetDataset, onGetCurrentlyHeldKey }: IColumnSortingDependencies) {
        super(onGetDataset);
        this._columnName = columnName;
        this._getCurrentlyHeldKey = onGetCurrentlyHeldKey;
    }

    public getSortValue() {
        this._dataset.sorting.find(x => x.name === this._columnName);
    }

    public setSortValue(direction: ComponentFramework.PropertyHelper.DataSetApi.Types.SortDirection) {
        const sortMap: Map<string, ComponentFramework.PropertyHelper.DataSetApi.SortStatus> = new Map(this._dataset.sorting.map(x => [x.name, x]));
        //TODO: have explicit parameter to always do multisort?
        if (this._getCurrentlyHeldKey?.() !== 'Shift') {
            sortMap.clear();
        }
        sortMap.set(this._columnName, {
            name: this._columnName,
            sortDirection: direction
        })
        //Power Apps only allows setting of sorting like this - https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
        //this is so stupid
        this._dataset.sorting = [...sortMap.values()];
    }

    public clear() {
        this._dataset.sorting = this._dataset.sorting.filter(x => x.name !== this._columnName);
    }
}

export class Sorting extends DatasetExtension {
    private _getCurrentlyHeldKey?: () => string;

    constructor({ onGetDataset, onGetCurrentlyHeldKey }: IDependencies) {
        super(onGetDataset);
        this._getCurrentlyHeldKey = onGetCurrentlyHeldKey;
    }

    public getColumnSorting(columnName: string) {
        return new ColumnSorting({
            columnName,
            onGetDataset: () => this._dataset,
            onGetCurrentlyHeldKey: () => this._getCurrentlyHeldKey?.()
        });
    }
}