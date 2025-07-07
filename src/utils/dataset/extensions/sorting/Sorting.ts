import { IDataset } from "@talxis/client-libraries";
import { createKeyHold} from "@solid-primitives/keyboard";
import { DatasetExtension } from "../DatasetExtension";


interface IColumnSortingDependencies {
    columnName: string;
    onGetDataset: () => IDataset;
}

class ColumnSorting extends DatasetExtension {
    private _columnName: string;
    private _isShiftKeyHeld = createKeyHold("Shift", { preventDefault: false });


    constructor({columnName, onGetDataset }: IColumnSortingDependencies) {
        super(onGetDataset);
        this._columnName = columnName;
    }

    public getSortValue() {
        this._dataset.sorting.find(x => x.name === this._columnName);
    }

    public setSortValue(direction: ComponentFramework.PropertyHelper.DataSetApi.Types.SortDirection) {
        const sortMap: Map<string, ComponentFramework.PropertyHelper.DataSetApi.SortStatus> = new Map(this._dataset.sorting.map(x => [x.name, x]));
        //TODO: have explicit parameter to always do multisort?
        if (!this._isShiftKeyHeld()) {
            sortMap.clear();
        }
        sortMap.set(this._columnName, {
            name: this._columnName,
            sortDirection: direction
        })
        this._dataset.sorting = [...sortMap.values()];
    }

    public clear() {
        this._dataset.sorting = this._dataset.sorting.filter(x => x.name !== this._columnName);
    }
}

export class Sorting extends DatasetExtension {

    public getColumnSorting(columnName: string) {
        return new ColumnSorting({
            columnName,
            onGetDataset: () => this._dataset
        });
    }
}