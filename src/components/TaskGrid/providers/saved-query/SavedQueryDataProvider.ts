import { DataTypes, IColumn } from "@talxis/client-libraries";
import { ICustomColumnsDataProvider } from "@components/TaskGrid/modules/custom-columns/CustomColumnsDataProvider";
import { INativeColumns } from "@components/TaskGrid/interfaces";
import { HookRegistry, ILocalizationService } from "@utils";
import { ITaskGridLabels } from "@components/TaskGrid/labels";
import { IUserQueryDataProvider } from "@components/TaskGrid/modules/interfaces";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";


/** Per-view outcome of deleting personal views. */
export type IDeletedUserQueriesResult = { success: true; deletedQueryIds: string[] } | { success: false; deletedQueryIds: string[]; errors: { queryId: string; error: any }[] };


/** A view: its identity, plus the columns, sorting and filtering it applies. */
export interface ISavedQuery extends ISavedQueryMetadata {
    id: string;
    /** Shown in the view switcher. */
    name: string;
    description?: string;
}

/** What each registered module stores per view, under its own key. Opaque to the grid. */
export interface ISavedQueryModuleState {
    [moduleKey: string]: unknown;
}

/** What a view applies to the grid. */
export interface ISavedQueryMetadata {
    /** The columns to show, in order. Also the grid's column catalogue when the view is a system one. */
    columns: IColumn[]
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression;
    linking?: ComponentFramework.PropertyHelper.DataSetApi.LinkEntityExposedExpression[];
    /** Opens the view as a flat list instead of a tree. */
    isFlatListEnabled?: boolean;
    /** What the modules store per view. Written by their state hooks; the grid only carries it. */
    moduleState?: ISavedQueryModuleState;
    searchQuery?: string | undefined;
    /** The columns quick find searches. */
    quickFindColumns?: string[];
}

/** Name of the virtual column holding each task's root-to-self path. */
export const PATH_COLUMN_NAME = 'path__virtual';
const REQUIRED_COLUMNS = ['subject', 'parentId', 'stackRank', 'stateCode'];

/**
 * The personal-views half of {@link ISavedQueryStrategy}. Supplying one is what enables the
 * user-queries feature — there is no separate flag.
 */
export interface IUserQueryStrategy {
    /** Returns views saved by the current user. */
    onGetUserQueries: () => Promise<ISavedQuery[]>;
    /** Whether the given query id is one of the user's own views, as opposed to a system view. */
    onIsUserQuery: (queryId: string) => boolean;
    /** Deletes the specified user views. Returns a per-query success/failure result. */
    onDeleteUserQueries: (queryIds: string[]) => Promise<IDeletedUserQueriesResult>;
    /** @returns The updated query id, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onUpdateUserQuery: (currentQuery: ISavedQuery) => Promise<string | null>;
    /** @returns The created query id, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onCreateUserQuery: (newQuery: { name: string; description?: string }, currentQuery: ISavedQuery) => Promise<string | null>;
}

/** Strategy interface for loading the system (non-deletable) saved views. */
export interface ISavedQueryStrategy {
    /** Returns the built-in (non-deletable) views. At least one system query must be returned. */
    onGetSystemQueries: () => Promise<ISavedQuery[]>;
}

/**
 * Applied to every query the provider serves, once it has finished building them — so a hook sees the final
 * columns, sorting and filtering, and gets the last word on any of it.
 *
 * Mutates the query rather than returning one: these are the objects the provider hands out, and not all of
 * them are its own.
 */
export type SavedQueryHook = (query: ISavedQuery) => void;

/**
 * Asked for a module's own state whenever a view's state is captured — a remount, or a save into a
 * personal view.
 *
 * Mutates rather than returning, like {@link SavedQueryHook}: write the slice with {@link setModuleState},
 * under a key of the module's own.
 */
export type SavedQueryStateHook = (metadata: Partial<ISavedQueryMetadata>) => void;

/**
 * One column, as a definition and a query's own declaration of it combine: the definition fills whatever the
 * declaration leaves out, and anything the declaration states wins.
 */
const mergeColumn = (definition: IColumn, declared: IColumn): IColumn => ({
    ...definition,
    ...declared,
    metadata: { ...definition.metadata, ...declared.metadata },
});

/**
 * A column detached from whatever it was built out of: its own `metadata`, and its own copy of every list
 * in there. Enough that writing to one query's column cannot turn up in another's.
 */
const copyColumn = (column: IColumn): IColumn => {
    if (!column.metadata) {
        return { ...column };
    }
    const metadata: { [key: string]: any } = { ...column.metadata };
    for (const [key, value] of Object.entries(metadata)) {
        if (Array.isArray(value)) {
            metadata[key] = [...value];
        }
    }
    return { ...column, metadata: metadata as IColumn['metadata'] };
};

/**
 * Adds a column to a query, or fills in a declaration of it.
 *
 * A query may name a column without describing it: a stored one keeps little more than the name, whether it
 * shows and where it sits. Whatever it leaves out comes from the definition.
 *
 * One definition can be applied to any number of queries, so what lands on each is a copy — a column
 * resized in one query is not resized in all of them.
 */
export const applyColumn = (query: ISavedQuery, definition: IColumn): void => {
    const declared = query.columns.find(column => column.name === definition.name);
    if (!declared) {
        query.columns.push(copyColumn(definition));
        return;
    }
    //in place, so anything already holding this column sees the merge as well
    Object.assign(declared, copyColumn(mergeColumn(definition, declared)));
};

/** One module's slice of a view, or `undefined` when it never wrote one. */
export const getModuleState = <TState>(metadata: Pick<ISavedQueryMetadata, 'moduleState'> | undefined, moduleKey: string): TState | undefined => {
    return metadata?.moduleState?.[moduleKey] as TState | undefined;
};

/** Writes one module's slice onto the metadata, creating the bag on first write. */
export const setModuleState = <TState>(metadata: Partial<ISavedQueryMetadata>, moduleKey: string, state: TState): void => {
    metadata.moduleState ??= {};
    metadata.moduleState[moduleKey] = state;
};

/** Serves the system views, tracks which view is active, and normalises every view's columns. */
export interface ISavedQueryDataProvider {
    /** Returns the full list of non-deletable system views. */
    getSystemQueries: () => ISavedQuery[];
    /**
     * Returns the user's personal views, or `[]` when no user-queries module is registered. Read from the
     * module's provider, so it never holds a second copy of the list.
     */
    getUserQueries: () => ISavedQuery[];
    /** Returns the currently active saved query. Throws if `refresh` has not been called yet. */
    getCurrentQuery: () => ISavedQuery;
    /** Looks up a query by id across system and user queries. Throws if not found. */
    getSavedQuery(id: string): ISavedQuery;
    /**
     * Registers a hook over the queries. Only hooks registered before a `refresh` reach the queries it
     * produces.
     *
     * @param priority Ascending — a lower number runs earlier, so a higher one gets the later word.
     * Defaults to `0`; hooks sharing a priority run in the order they were registered.
     */
    registerHook: (hook: SavedQueryHook, priority?: number) => void;
    /**
     * Registers a state hook. Runs on every capture from then on.
     *
     * @param priority As for {@link ISavedQueryDataProvider.registerHook}.
     */
    registerStateHook: (hook: SavedQueryStateHook, priority?: number) => void;
    /**
     * Runs every registered state hook over the metadata. Called by the grid wherever it captures a
     * view's state — a consumer has no reason to call it.
     */
    applyStateHooks: (metadata: Partial<ISavedQueryMetadata>) => void;
    /** Fetches system and user queries and sets the initial active query. */
    refresh: () => Promise<void>;
    /** Releases the resources held by the provider. */
    destroy: () => void;
}

export interface ISavedQueryDataProviderParameters {
    /** Where the system views come from. */
    strategy: ISavedQueryStrategy;
    /** Where the column names, the labels and the optional module providers are reached. */
    services: ITaskGridServiceLocator;
    preferredQuery?: Partial<ISavedQuery> & { id: string };
}

/**
 * Serves the grid's views: the system ones from the descriptor's strategy, and the user's own from the
 * user-queries module when it is registered.
 */
export class SavedQueryDataProvider implements ISavedQueryDataProvider {
    private _strategy: ISavedQueryStrategy
    private _services: ITaskGridServiceLocator;
    private _systemQueries: ISavedQuery[] = [];
    private _currentQuery?: ISavedQuery;
    private _systemQueriesColumnsMap: Map<string, IColumn> = new Map();
    private _preferredQuery?: Partial<ISavedQuery> & { id: string };
    private _hooks = new HookRegistry<SavedQueryHook>();
    private _stateHooks = new HookRegistry<SavedQueryStateHook>();

    constructor(parameters: ISavedQueryDataProviderParameters) {
        this._strategy = parameters.strategy;
        this._services = parameters.services;
        this._preferredQuery = parameters.preferredQuery;
    }

    //the personal-views provider, from the user-queries module. Absent means the feature is off: no *My views*, no save
    //commands and no view manager.
    private get _userQueryProvider(): IUserQueryDataProvider | undefined {
        return this._services.find('userQueriesModule')?.provider;
    }

    //the user-defined columns, when the custom-columns module is registered.
    private get _customColumnsDataProvider(): ICustomColumnsDataProvider | undefined {
        return this._services.find('customColumnsModule')?.provider;
    }

    private get _nativeColumns(): INativeColumns {
        return this._services.get('nativeColumns');
    }

    private get _localizationService(): ILocalizationService<ITaskGridLabels> {
        return this._services.get('localizationService');
    }

    public getSystemQueries(): ISavedQuery[] {
        return this._systemQueries;
    }

    public getUserQueries(): ISavedQuery[] {
        return this._userQueryProvider?.getQueries() ?? [];
    }

    public getCurrentQuery(): ISavedQuery {
        if (!this._currentQuery) {
            throw new Error('Current query is not set. Make sure to call refresh() and wait for it to complete before accessing the current query.');
        }
        return this._currentQuery;
    }

    public getSavedQuery(id: string): ISavedQuery {
        const query = [...this._systemQueries, ...this.getUserQueries()].find(q => q.id === id);
        if (!query) {
            throw new Error(`Query with id ${id} not found. Make sure to call refresh() and wait for it to complete before accessing the saved query.`);
        }
        return query;
    }

    public registerHook(hook: SavedQueryHook, priority?: number): void {
        this._hooks.register(hook, priority);
    }

    public registerStateHook(hook: SavedQueryStateHook, priority?: number): void {
        this._stateHooks.register(hook, priority);
    }

    public applyStateHooks(metadata: Partial<ISavedQueryMetadata>): void {
        this._stateHooks.apply(metadata);
    }

    public async destroy() {
        //the module's provider owns its own listeners and is destroyed with it
    }

    public async refresh() {
        const systemQueries = await this._strategy.onGetSystemQueries();
        const userQueries = await this._userQueryProvider?.refresh() ?? [];
        if (systemQueries.length === 0) {
            throw new Error('At least one system query is required');
        }
        this._includePathColumn(systemQueries[0].columns);
        const allQueries = [...systemQueries, ...userQueries];
        this._systemQueries = systemQueries;

        const systemQueryColumnEntries = systemQueries.flatMap(
            query => query.columns.map(col => [col.name, col] as [string, IColumn])
        );
        const customColumnEntries = this._customColumnsDataProvider
            ? this._customColumnsDataProvider.getColumns().map(col => [col.name, col] as [string, IColumn])
            : [];

        this._systemQueriesColumnsMap = new Map<string, IColumn>([
            ...systemQueryColumnEntries,
            ...customColumnEntries
        ]);

        const preferredQueryInAllQueries = allQueries.find(q => q.id === this._preferredQuery?.id);
        this._currentQuery = preferredQueryInAllQueries ?? userQueries[0] ?? systemQueries[0];
        //preferred query might have some required columns missing
        this._currentQuery = this._processQueries([{
            ...this._currentQuery,
            ...(preferredQueryInAllQueries ? this._preferredQuery : {}),
        }])[0];
        //last, so a hook sees the finished query, preferred-query overlay included
        this._applyHooks(userQueries);
    }

    //the current query is a copy of whichever query it came from, with its own columns array, so it is hooked in its
    //own right rather than through the one it was copied from.
    private _applyHooks(userQueries: ISavedQuery[]): void {
        for (const query of [...this._systemQueries, ...userQueries, this.getCurrentQuery()]) {
            this._hooks.apply(query);
        }
    }

    private _processQueries(queries: ISavedQuery[]) {
        return queries.map(query => {
            this._includeRequiredColumns(query.columns);
            this._harmonizeColumns(query.columns);
            return {
                ...query,
                ...this._parseSavedQueryMetadata(query)
            }
        })
    }

    private _includeRequiredColumns(columns: IColumn[]) {
        const allQueries = [...this.getSystemQueries(), ...this.getUserQueries()];
        const allQueryColumns = [...new Map(allQueries.flatMap(query => query.columns.map(col => [col.name, col]))).values()];
        for (const requiredColumnName of REQUIRED_COLUMNS) {
            const mappedRequiredColumnName = this._nativeColumns[requiredColumnName as keyof INativeColumns];
            if (!columns.find(col => col.name === mappedRequiredColumnName)) {
                const columnFromQueries = allQueryColumns.find(col => col.name === mappedRequiredColumnName);
                if (!columnFromQueries) {
                    throw new Error(`Required column ${mappedRequiredColumnName} is missing from both current query and all available queries`);
                }
                columns.push({
                    ...columnFromQueries,
                    isHidden: true
                });
            }
        }
        this._includePathColumn(columns);
    }

    private _harmonizeColumns(columns: IColumn[]) {
        for (const column of columns) {
            switch (column.name) {
                case this._nativeColumns.subject: {
                    column.isHidden = false;
                    break;
                }
                case this._nativeColumns.path: {
                    column.metadata = {
                        ...column.metadata,
                        IsValidForUpdate: false
                    }
                    break;
                }
            }
        }
    }

    private _includePathColumn(columns: IColumn[]) {
        if (!columns.find(col => col.name === PATH_COLUMN_NAME)) {
            columns.push({
                name: PATH_COLUMN_NAME,
                dataType: DataTypes.Multiple,
                displayName: this._localizationService.getLocalizedString('path'),
                isVirtual: true,
                visualSizeFactor: 300,
                isHidden: true
            })
        }
        return columns;
    }

    //repairs each of a query's columns against the catalogue, which is what a stored query needs: it keeps little more
    //than a column's name. A catalogue entry the query does not name is not added — it is not part of that query.
    private _parseSavedQueryMetadata(metadata: ISavedQueryMetadata): ISavedQueryMetadata {
        const columns = metadata.columns.map(column => {
            const systemColumn = this._systemQueriesColumnsMap.get(column.name);
            return systemColumn ? mergeColumn(systemColumn, column) : column;
        });
        return { ...metadata, columns };
    }
}