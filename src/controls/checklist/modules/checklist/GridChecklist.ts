import { IRecord } from "@talxis/client-libraries";
import { IGrid } from "@controls/grid";
import { ChecklistColumns } from "./runtime/ChecklistColumns";
import { ChecklistReordering } from "./runtime/ChecklistReordering";
import { ChecklistNewItemRow } from "./runtime/ChecklistNewItemRow";

/** Which of the provider's columns carry the label, the order and the completion state. */
export interface IChecklistFieldMapping {
    /** Column holding the item's label. */
    name: string;
    /** Column the list is ordered by, hidden from the grid. */
    stackRank: string;
    /** Boolean column the item's completion is stored in, drawn as the checkbox column. */
    completed: string;
}

declare module "@controls/grid/interfaces" {
    interface IGridModuleMap {
        /** The checklist, in a grid the `CheckList` draws. */
        checklist: IGridChecklist;
    }
}

export interface IGridChecklistParameters {
    grid: IGrid;
    fieldMapping: IChecklistFieldMapping;
}

/** What makes the grid a checklist. */
export interface IGridChecklist {
    /** The columns the checklist works with. */
    getFieldMapping(): IChecklistFieldMapping;
    /** Whether the record is one of the list's items, not the row that adds one. */
    isItem(record: IRecord): boolean;
    /** Whether the item is finished. */
    isCompleted(record: IRecord): boolean;
    /** Called as the grid tears down. */
    destroy(): void;
}

export class GridChecklist implements IGridChecklist {
    private _grid: IGrid;
    private _fieldMapping: IChecklistFieldMapping;
    private _newItemRow?: ChecklistNewItemRow;

    constructor(parameters: IGridChecklistParameters) {
        this._grid = parameters.grid;
        this._fieldMapping = parameters.fieldMapping;
        this._warnWhenUnsorted();
        new ChecklistColumns({ services: this._grid.services, checklist: this });
        if (this._grid.modules.find('editing')) {
            new ChecklistReordering({ grid: this._grid, checklist: this });
            this._newItemRow = new ChecklistNewItemRow({ grid: this._grid, checklist: this });
        }
    }

    public destroy(): void {
        this._newItemRow?.destroy();
    }

    private _warnWhenUnsorted(): void {
        const sorting = this._grid.services.get('provider').getSorting();
        if (sorting.length !== 1 || sorting[0].name !== this._fieldMapping.stackRank || sorting[0].sortDirection !== 0) {
            console.warn(`CheckList: the provider is not sorted by '${this._fieldMapping.stackRank}', so the items show out of order. Call sortChecklistProvider before it loads.`);
        }
    }

    public getFieldMapping(): IChecklistFieldMapping {
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
