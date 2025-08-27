import { GridDependency } from "../../core/model/GridDependency";

export class Selection extends GridDependency {
    private _selectedRecordIdsSet: Set<string> = new Set<string>();

    public toggle(recordId: string, clearExistingSelection?: boolean) {
        this._selectedRecordIdsSet = new Set(this.selectedRecordIds);
        const shouldSelect = !this._selectedRecordIdsSet.has(recordId);
        if (clearExistingSelection) {
            this._selectedRecordIdsSet.clear();
        }
        if (!shouldSelect) {
            this._selectedRecordIdsSet.delete(recordId);
        }
        else {
            this._selectedRecordIdsSet.add(recordId);
        }
        this._setSelectedRecords();
    }

    public setSelectedRecordIds(ids: string[]) {
        this._dataset.setSelectedRecordIds(ids);
    }

    public get selectedRecordIds() {
        return this._dataset.getSelectedRecordIds();
    }
    public get allRecordsSelected() {
        return this.selectedRecordIds.length === this._dataset.sortedRecordIds.length;
    }
    public get type() {
        switch (this._grid.props.parameters.SelectableRows?.raw) {
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