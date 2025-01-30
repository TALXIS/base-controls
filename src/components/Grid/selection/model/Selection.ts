import { IRecord } from "@talxis/client-libraries";
import { GridDependency } from "../../core/model/GridDependency";

export class Selection extends GridDependency {
    private _selectedRecordIdsSet: Set<string> = new Set<string>();

    public async toggle(record: IRecord, selected: boolean, clearExistingSelection?: boolean): Promise<void> {
        this._selectedRecordIdsSet = new Set(this.selectedRecordIds);
        const recordId = record.getRecordId();
        if(clearExistingSelection || this.type === 'single') {
            this._selectedRecordIdsSet.clear()
        }
        if(selected) {
            this._selectedRecordIdsSet.add(recordId);
        }
        else {
            this._selectedRecordIdsSet.delete(recordId);
        }
        this._setSelectedRecords();
    }

    public get selectedRecordIds() {
        return this._dataset.getSelectedRecordIds();
    }
    public get allRecordsSelected() {
        return this.selectedRecordIds.length === this._dataset.sortedRecordIds.length;
    }
    public get type() {
        switch(this._grid.props.parameters.SelectableRows?.raw) {
            case undefined:
            case null: {
                return 'multiple'
            }
            case 'none': {
                return undefined;
            }
            default: return this._grid.props.parameters.SelectableRows?.raw;
        }
    }

    public clear() {
        this._grid.dataset.setSelectedRecordIds([]);
    }
    public selectAll() {
        this._grid.dataset.setSelectedRecordIds(this._dataset.sortedRecordIds)
    }
    private _setSelectedRecords() {
        this._grid.dataset.setSelectedRecordIds([...this._selectedRecordIdsSet.values()]);
    }
}