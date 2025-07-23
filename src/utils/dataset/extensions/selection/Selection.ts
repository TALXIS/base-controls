import { IDataProvider, IDataset } from "@talxis/client-libraries";


interface IDependencies {
    onGetDataProvider: () => IDataProvider;
    onGetSelectionType: () => 'single' | 'multiple' | 'none';
}

export class Selection {
    private _getSelectionType: () => 'single' | 'multiple' | 'none';
    private _getDataProvider: () => IDataProvider;
    private _selectedRecordIdsSet: Set<string> = new Set<string>();

    constructor({ onGetDataProvider, onGetSelectionType }: IDependencies) {
        this._getSelectionType = onGetSelectionType;
        this._getDataProvider = onGetDataProvider;
        this._selectedRecordIdsSet = new Set(this._dataProvider.getSelectedRecordIds());
        this._dataProvider.addEventListener('onRecordsSelected', (ids) => {
            this._selectedRecordIdsSet = new Set(ids);
        });

    }
    public areAllRecordsSelected(): boolean {
        const selectedRecordIds = this._dataProvider.getSelectedRecordIds();
        const sortedRecordIds = this._dataProvider.getSortedRecordIds();
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
        this._dataProvider.setSelectedRecordIds([...this._selectedRecordIdsSet.values()]);
    }

    private get _selectionType() {
        return this._getSelectionType();
    }

    private get _dataProvider() {
        return this._getDataProvider();
    }

}