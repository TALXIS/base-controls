import { DataTypes, IRawRecord, IRecordSaveOperationResult, MemoryDataProvider } from "@talxis/client-libraries";

export interface ILocalStorageUserQueriesProviderParameters {
    /** The localStorage entry the views are kept in; one per control. */
    storageKey: string;
    /** The header of the views' name in Manage views. */
    nameLabel?: string;
}

/** The user's views kept in the browser's localStorage, as Manage views edits them. */
export class LocalStorageUserQueriesProvider extends MemoryDataProvider {
    private _storageKey: string;

    constructor(parameters: ILocalStorageUserQueriesProviderParameters) {
        super({
            dataSource: readViews(parameters.storageKey),
            metadata: { PrimaryIdAttribute: 'id', PrimaryNameAttribute: 'name', QuickFindColumns: ['name'] },
            columns: [
                { name: 'name', displayName: parameters.nameLabel ?? 'Name', dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 300 },
            ],
        });
        this._storageKey = parameters.storageKey;
        this.addEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
        this.addEventListener('onAfterRecordsDeleted', this._store);
    }

    private _onAfterRecordSaved = (result: IRecordSaveOperationResult): void => {
        if (result.success) {
            this._store();
        }
    };

    //a view the user is still naming is in the data source before it is saved
    private _store = (): void => {
        const unsavedIds = new Set(this.getRecords().filter(record => record.isNew()).map(record => record.getRecordId()));
        const savedViews = this.getDataSource().filter(rawRecord => !unsavedIds.has(rawRecord.id));
        window.localStorage.setItem(this._storageKey, JSON.stringify(savedViews));
    };
}

//a blocked or broken entry leaves the user with no saved views
export const readViews = (storageKey: string): IRawRecord[] => {
    try {
        return JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
    }
    catch {
        return [];
    }
};
