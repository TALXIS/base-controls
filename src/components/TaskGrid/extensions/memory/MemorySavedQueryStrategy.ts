import { IColumn, IDataProvider, IMemoryProviderEntityMetadata, MemoryDataProvider } from "@talxis/client-libraries";
import { IDeletedUserQueriesResult, ISavedQuery, ISavedQueryStrategy } from "@components/TaskGrid/providers";

//the dialog's backing entity is synthetic - its records are projected from the query list below
const ID_ATTRIBUTE = 'queryid';
const NAME_ATTRIBUTE = 'name';

const METADATA: IMemoryProviderEntityMetadata = {
    PrimaryIdAttribute: ID_ATTRIBUTE,
    LogicalName: 'memory_userquery',
    QuickFindColumns: [NAME_ATTRIBUTE],
};

const COLUMNS: IColumn[] = [
    { name: ID_ATTRIBUTE, dataType: 'SingleLine.Text', displayName: 'ID', isHidden: true },
    { name: NAME_ATTRIBUTE, dataType: 'SingleLine.Text', displayName: 'Name', visualSizeFactor: 200 },
];

/** Constructor parameters for {@link MemorySavedQueryStrategy}. */
export interface IMemorySavedQueryStrategyParams {
    /** Returns the built-in, non-deletable views. At least one is required by the grid. */
    onGetSystemQueries: () => Promise<ISavedQuery[]>;
    /** Initial user views. Cloned on construction; edits are kept in memory for the session. */
    userQueries?: ISavedQuery[];
}

/**
 * In-memory {@link ISavedQueryStrategy} — the counterpart to `DataverseSavedQueryStrategy`.
 *
 * The user-query list held here is the single source of truth; the data provider handed to the
 * create/rename dialog is a projection of it, rebuilt on each request and synced back on rename.
 */
export class MemorySavedQueryStrategy implements ISavedQueryStrategy {
    private _onGetSystemQueries: () => Promise<ISavedQuery[]>;
    private _userQueries: ISavedQuery[];
    private _dataProvider?: MemoryDataProvider;

    /** @param params — see {@link IMemorySavedQueryStrategyParams}. */
    constructor(params: IMemorySavedQueryStrategyParams) {
        this._onGetSystemQueries = params.onGetSystemQueries;
        //copied so the caller's array is not mutated as the user edits views
        this._userQueries = (params.userQueries ?? []).map(query => ({ ...query }));
    }

    // ── ISavedQueryStrategy ──────────────────────────────────────────────────

    public onGetSystemQueries = async (): Promise<ISavedQuery[]> => {
        return await this._onGetSystemQueries();
    };

    public onGetUserQueries = async (): Promise<ISavedQuery[]> => {
        return [...this._userQueries];
    };

    public onCreateUserQuery = async (
        newQuery: { name: string; description?: string },
        currentQuery: ISavedQuery,
    ): Promise<string | null> => {
        const id = crypto.randomUUID();
        this._userQueries.push({ ...currentQuery, id, name: newQuery.name });
        return id;
    };

    public onUpdateUserQuery = async (currentQuery: ISavedQuery): Promise<string | null> => {
        const index = this._userQueries.findIndex(query => query.id === currentQuery.id);
        if (index >= 0) {
            this._userQueries[index] = { ...currentQuery };
        }
        return currentQuery.id;
    };

    public onDeleteUserQueries = async (queryIds: string[]): Promise<IDeletedUserQueriesResult> => {
        const deletedQueryIds: string[] = [];
        for (const id of queryIds) {
            const index = this._userQueries.findIndex(query => query.id === id);
            if (index >= 0) {
                this._userQueries.splice(index, 1);
                deletedQueryIds.push(id);
            }
        }
        if (deletedQueryIds.length > 0) {
            //keep an already-open dialog in step with the deletion
            await this._dataProvider?.deleteRecords(deletedQueryIds);
        }
        return { success: true, deletedQueryIds };
    };

    // ── Data provider ────────────────────────────────────────────────────────

    /** Creates the `IDataProvider` that backs the user-query create/rename dialog. */
    public createDataProvider(): IDataProvider {
        const provider = new MemoryDataProvider({
            dataSource: this._userQueries.map(query => ({
                [ID_ATTRIBUTE]: query.id,
                [NAME_ATTRIBUTE]: query.name,
            })),
            metadata: METADATA,
        });
        provider.setColumns(COLUMNS);
        provider.addEventListener('onAfterRecordSaved', result => {
            if (!result.success) {
                return;
            }
            const query = this._userQueries.find(item => item.id === result.recordId);
            const record = provider.getRecordsMap()[result.recordId];
            if (query && record) {
                query.name = record.getValue(NAME_ATTRIBUTE) as string;
            }
        });
        this._dataProvider = provider;
        return provider;
    }
}
