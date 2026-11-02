import { IRecord } from "@talxis/client-libraries";
import { IGrid } from "../../grid/services/runtime";
import { CheckListColumns } from "./CheckListColumns";
import { CheckListReordering } from "./CheckListReordering";
import { CheckListNewItemRow } from "./CheckListNewItemRow";


/** Which of the provider's columns carry the label, the order and the completion state. */
export interface ICheckListFieldMapping {
    /** Column holding the item's label. */
    name: string;
    /** Column the list is ordered by, hidden from the grid. */
    stackRank: string;
    /** Boolean column the item's completion is stored in, drawn as the checkbox column. */
    completed: string;
}

declare module "../../grid/interfaces" {
    interface IGridModuleMap {
        /** The checklist, in a grid the `CheckList` draws. */
        checkList: IGridCheckList;
    }
}

export interface IGridCheckListParameters {
    grid: IGrid;
    fieldMapping: ICheckListFieldMapping;
}

/** What makes the grid a checklist. */
export interface IGridCheckList {
    /** The columns the checklist works with. */
    getFieldMapping(): ICheckListFieldMapping;
    /** Whether the record is one of the list's items, not the row that adds one. */
    isItem(record: IRecord): boolean;
    /** Whether the item is finished. */
    isCompleted(record: IRecord): boolean;
    /** Called as the grid tears down. */
    destroy(): void;
}

export class GridCheckList implements IGridCheckList {
    private _grid: IGrid;
    private _fieldMapping: ICheckListFieldMapping;
    private _newItemRow?: CheckListNewItemRow;

    constructor(parameters: IGridCheckListParameters) {
        this._grid = parameters.grid;
        this._fieldMapping = parameters.fieldMapping;
        this._warnWhenUnsorted();
        new CheckListColumns({ services: this._grid.services, checkList: this });
        if (this._grid.modules.find('editing')) {
            new CheckListReordering({ grid: this._grid, checkList: this });
            this._newItemRow = new CheckListNewItemRow({ grid: this._grid, checkList: this });
        }
    }

    public destroy(): void {
        this._newItemRow?.destroy();
    }

    private _warnWhenUnsorted(): void {
        const sorting = this._grid.services.get('provider').getSorting();
        if (sorting.length !== 1 || sorting[0].name !== this._fieldMapping.stackRank || sorting[0].sortDirection !== 0) {
            console.warn(`CheckList: the provider is not sorted by '${this._fieldMapping.stackRank}', so the items show out of order. Call sortCheckListProvider before it loads.`);
        }
    }

    public getFieldMapping(): ICheckListFieldMapping {
        return this._fieldMapping;
    }

    public isItem(record: IRecord): boolean {
        return record.getDataProvider() === this._grid.services.get('provider');
    }

    public isCompleted(record: IRecord): boolean {
        //a TwoOptions field reads back as the string '1' or '0'
        return record.getValue(this._fieldMapping.completed) === '1';
    }
}
