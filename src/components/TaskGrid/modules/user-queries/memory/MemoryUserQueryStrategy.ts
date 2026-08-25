import { IDeletedUserQueriesResult, ISavedQuery, IUserQueryStrategy } from "@components/TaskGrid/providers";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** Constructor parameters for {@link MemoryUserQueryStrategy}. */
export interface IMemoryUserQueryStrategyParams {
    /**
     * Where the rest of the grid is reached. Every strategy takes it, whether or not this one has a use
     * for it yet — one shape to remember, and nothing to change when it does.
     */
    services: ITaskGridServiceLocator;
    /**
     * The personal views. **This array is written into** — creating, renaming and deleting a view
     * mutates it — so pass the one the descriptor persists rather than a copy.
     */
    userQueries: ISavedQuery[];
}

/**
 * In-memory {@link IUserQueryStrategy} — personal views held in the array it was given, so a view
 * created just before the grid remounts is still there when the strategy is rebuilt.
 */
export class MemoryUserQueryStrategy implements IUserQueryStrategy {
    private _userQueries: ISavedQuery[];

    constructor(params: IMemoryUserQueryStrategyParams) {
        this._userQueries = params.userQueries;
    }

    public async onGetUserQueries(): Promise<ISavedQuery[]> {
        return [...this._userQueries];
    }

    public onIsUserQuery(queryId: string): boolean {
        return this._userQueries.some(query => query.id === queryId);
    }

    public async onCreateUserQuery(newQuery: { name: string; description?: string }, currentQuery: ISavedQuery): Promise<string | null> {
        const id = crypto.randomUUID();
        this._userQueries.push({ ...this._cloneQuery(currentQuery), id, name: newQuery.name, description: newQuery.description });
        return id;
    }

    public async onUpdateUserQuery(currentQuery: ISavedQuery): Promise<string | null> {
        const index = this._userQueries.findIndex(query => query.id === currentQuery.id);
        if (index >= 0) {
            this._userQueries[index] = this._cloneQuery(currentQuery);
        }
        return currentQuery.id;
    }

    //a deep-enough copy: the grid writes into a view's `columns` array, so two views must not share one
    private _cloneQuery(query: ISavedQuery): ISavedQuery {
        return {
            ...query,
            columns: query.columns.map(column => ({ ...column })),
            sorting: query.sorting ? [...query.sorting] : undefined,
            quickFindColumns: query.quickFindColumns ? [...query.quickFindColumns] : undefined,
            filtering: query.filtering ? structuredClone(query.filtering) : undefined,
        };
    }

    public async onDeleteUserQueries(queryIds: string[]): Promise<IDeletedUserQueriesResult> {
        const deletedQueryIds: string[] = [];
        for (const id of queryIds) {
            const index = this._userQueries.findIndex(query => query.id === id);
            if (index >= 0) {
                this._userQueries.splice(index, 1);
                deletedQueryIds.push(id);
            }
        }
        return { success: true, deletedQueryIds };
    }
}
