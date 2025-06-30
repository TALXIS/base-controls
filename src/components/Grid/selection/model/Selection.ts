import { IDataset } from "@talxis/client-libraries";
import { DatasetExtension } from "../../core/model/DatasetExtension";


interface IDependencies {
    onGetDataset: () => IDataset;
    onGetSelectionType: () => 'single' | 'multiple' | 'none';
}

export class Selection extends DatasetExtension {
    private _getSelectionType: () => 'single' | 'multiple' | 'none';
    private _selectedRecordIdsSet: Set<string> = new Set<string>();

    constructor({ onGetDataset, onGetSelectionType }: IDependencies) {
        super(onGetDataset);
        this._getSelectionType = onGetSelectionType;

        this._dataset.addEventListener('onRecordsSelected', (ids) => {
            this._selectedRecordIdsSet = new Set(ids);
        });

    }
    public areAllRecordsSelected(): boolean {
        const selectedRecordIds = this._dataset.getSelectedRecordIds();
        const sortedRecordIds = this._dataset.sortedRecordIds;
        return selectedRecordIds.length === sortedRecordIds.length;
    }
    public getSelectedRecordIdsSet(): Set<string> {
        return this._selectedRecordIdsSet;
    }

    public toggle(recordId: string) {
        switch (this._selectionType) {
            case 'none': {
                return;
            }
            case 'single': {
                if (this._selectedRecordIdsSet.has(recordId)) {
                    this._selectedRecordIdsSet.clear();
                }
                else {
                    this._selectedRecordIdsSet.clear();
                    this._selectedRecordIdsSet.add(recordId);
                }
                break;
            }
            case 'multiple': {
                if (this._selectedRecordIdsSet.has(recordId)) {
                    this._selectedRecordIdsSet.delete(recordId);
                }
                else {
                    this._selectedRecordIdsSet.add(recordId);
                }
                break;
            }
        }
        this._dataset.setSelectedRecordIds([...this._selectedRecordIdsSet.values()]);
    }

    private get _selectionType() {
        return this._getSelectionType();
    }

}