import { GridDependency } from "../../core/model/GridDependency";

export class Selection extends GridDependency {
    private _selectedRecordIdsSet: Set<string> = new Set<string>();
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;

    public async toggle(record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord, newState: boolean, clearExistingSelection?: boolean, disableDebounce?: boolean): Promise<void> {
        const recordId = record.getRecordId();
        if(!this.debounceTimer) {
            this._selectedRecordIdsSet = new Set(this.selectedRecordIds);
        }
        if (clearExistingSelection) {
            this._selectedRecordIdsSet.clear();
        }
        if (newState === false) {
            this._selectedRecordIdsSet.delete(recordId);
        }
        else {
            if (this.type === 'single') {
                this._selectedRecordIdsSet.clear();
            }
            this._selectedRecordIdsSet.add(recordId);
        }

        if (this.debounceTimer !== null) {
            clearTimeout(this.debounceTimer);
        }
        if(disableDebounce) {
            this._setSelectedRecords();
            return;
        }
        return new Promise((resolve) => {
            this.debounceTimer = setTimeout(() => {
                this._setSelectedRecords();
                resolve();
            }, 0);
        })
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
        this.debounceTimer = null; // Reset debounce timer after execution
        this._selectedRecordIdsSet = new Set();
    }
}