import { GridDependency } from "../../core/model/GridDependency";

export class Selection extends GridDependency {
    //TODO: check how this works with single selection
    public toggle(record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord) {
        const recordId = record.getRecordId();
        const selectedRecordIds = new Set(this._dataset.getSelectedRecordIds());
        if (this._grid.props.parameters.SelectableRows?.raw === 'single') {
            selectedRecordIds.clear();
        }
        if (selectedRecordIds.has(recordId)) {
            selectedRecordIds.delete(recordId);
        }
        else {
            selectedRecordIds.add(record.getRecordId());
        }
        this._grid.dataset.setSelectedRecordIds([...selectedRecordIds.values()])
    }
}