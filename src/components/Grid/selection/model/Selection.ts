import { GridDependency } from "../../core/model/GridDependency";

export class Selection extends GridDependency {
    public toggle(record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord) {
        const recordId = record.getRecordId();
        const selectedRecordIds = new Set(this._dataset.getSelectedRecordIds());
        if(selectedRecordIds.has(recordId)) {
            selectedRecordIds.delete(recordId);
        }
        else {
            if (this.type === 'single') {
                selectedRecordIds.clear();
            }
            selectedRecordIds.add(recordId);
        }
        this._grid.dataset.setSelectedRecordIds([...selectedRecordIds.values()])
    }

    public get selectedRecordIds() {
        return this._grid.dataset.getSelectedRecordIds();
    }
    public get allRecordsSelected() {
        return this.selectedRecordIds.length === this._dataset.sortedRecordIds.length;
    }
    public get type() {
        switch(this._grid.props.parameters.SelectableRows?.raw) {
            case 'single':
            case 'true': {
                return 'single';
            }
            case 'multiple': {
                return 'multiple';
            }
        }
        return undefined;
    }

    public clear() {
        this._grid.dataset.setSelectedRecordIds([]);
    }
    public selectAll() {
        this._grid.dataset.setSelectedRecordIds(this._dataset.sortedRecordIds)
    }
}